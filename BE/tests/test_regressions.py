"""API regressions against an isolated seeded MySQL instance. Never point at production.

TRODAY_TEST_API=http://127.0.0.1:18081/api/v1
TRODAY_TEST_MYSQL=<mysql executable>; TRODAY_TEST_DB_PORT=33572
TRODAY_ALLOW_TEST_WRITES=1 python -X utf8 -m unittest discover -s tests -v
"""
import base64
import datetime as dt
from decimal import Decimal
import hashlib
import json
import os
from pathlib import Path
import subprocess
import unittest
import urllib.error
import urllib.request
import uuid

BASE = os.getenv('TRODAY_TEST_API', 'http://127.0.0.1:18081/api/v1')
MYSQL = os.getenv('TRODAY_TEST_MYSQL', r'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe')
DB_PORT = os.getenv('TRODAY_TEST_DB_PORT', '33572')
TODAY = dt.datetime.now(dt.timezone(dt.timedelta(hours=7))).date()

def sql(statement):
    result = subprocess.run([MYSQL, '--protocol=tcp', '-h127.0.0.1', '-P'+DB_PORT, '-uroot', '--default-character-set=utf8mb4', '-N', '-B', 'troday'], input=statement.encode(), stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    return result.stdout.decode('utf-8').strip()

def call(path, token=None, body=None, method='GET', headers=None, raw=None):
    h = {'Accept':'application/json', **(headers or {})}
    if token: h['Authorization']='Bearer '+token
    if method != 'GET': h.setdefault('Idempotency-Key', str(uuid.uuid4()))
    if body is not None: h['Content-Type']='application/json'
    data = raw if raw is not None else json.dumps(body,ensure_ascii=False).encode() if body is not None else None
    request = urllib.request.Request(BASE+path, data=data, method=method, headers=h)
    try: response=urllib.request.urlopen(request, timeout=25)
    except urllib.error.HTTPError as error: response=error
    value=response.read(); response.close()
    return response.status, json.loads(value) if 'json' in response.headers.get('Content-Type','') else value, response.headers

def data(path, token=None, body=None, method='GET', headers=None):
    status, result, _=call(path,token,body,method,headers)
    if status>=400: raise AssertionError(f'{method} {path}: {status} {result}')
    return result['data']

def rows(value): return value.get('items',[]) if isinstance(value,dict) else value

@unittest.skipUnless(os.getenv('TRODAY_ALLOW_TEST_WRITES')=='1','Requires isolated test database and explicit test-write flag')
class Regressions(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not BASE.startswith(('http://127.0.0.1:', 'http://localhost:')) or DB_PORT=='3306':
            raise RuntimeError('Tests require a dedicated local MySQL port and API')
        cls.admin=data('/auth/login',body={'identifier':'admin@troday.example','password':'123456'},method='POST')
        cls.owner=data('/auth/login',body={'identifier':'landlord01@troday.example','password':'123456'},method='POST')
        cls.tenant=data('/auth/login',body={'identifier':'tenant01@troday.example','password':'123456'},method='POST')
        cls.a=cls.new_user();cls.b=cls.new_user()

    @classmethod
    def new_user(cls):
        email='regression-'+uuid.uuid4().hex+'@example.test'
        data('/auth/register',body={'fullName':'Regression Tenant','email':email,'password':'A-test-password-123'},method='POST')
        return data('/auth/login',body={'identifier':email,'password':'A-test-password-123'},method='POST')

    def test_01_pagination_validation_and_search(self):
        s,value,_=call('/posts?pageSize=1')
        self.assertEqual(200,s);page=value['data'];self.assertEqual(1,len(page['items']));self.assertGreater(page['totalItems'],1)
        first=page['items'][0]['id'];second=data('/posts?pageSize=1&page=2');self.assertNotEqual(first,second['items'][0]['id'])
        self.assertEqual(422,call('/posts?pageSize=101')[0]);self.assertEqual(422,call('/posts?page=0')[0])
        self.assertEqual([],data('/posts?q=zzzz-no-such-post-9911')['items'])

    def test_02_resident_contract_access_and_csv(self):
        contracts=rows(data('/contracts',self.tenant['accessToken']))
        self.assertTrue(contracts)
        self.assertEqual(200,call('/contracts/'+str(contracts[0]['id']),self.tenant['accessToken'])[0])
        status,content,headers=call('/residents/export',self.owner['accessToken'])
        self.assertEqual(200,status);self.assertIn('text/csv',headers['Content-Type']);self.assertTrue(content.startswith(b'\xef\xbb\xbf'))

    def test_03_roles_idempotency_and_house_version(self):
        body={'name':'Regression House','address':'Address','provinceCode':'01'}
        self.assertEqual(403,call('/houses',self.a['accessToken'],body,'POST')[0])
        key={'Idempotency-Key':str(uuid.uuid4())}
        one=data('/houses',self.owner['accessToken'],body,'POST',key)
        two=data('/houses',self.owner['accessToken'],body,'POST',key);self.assertEqual(one['id'],two['id'])
        self.assertEqual(409,call('/houses',self.owner['accessToken'],{**body,'name':'Other'},'POST',key)[0])
        hid=one['id'];self.assertEqual(428,call(f'/houses/{hid}',self.owner['accessToken'],{'name':'New'},'PATCH')[0])
        self.assertEqual(409,call(f'/houses/{hid}',self.owner['accessToken'],{'name':'New'},'PATCH',{'If-Match':'"0"'})[0])
        changed=data(f'/houses/{hid}',self.owner['accessToken'],{'name':'New'},'PATCH',{'If-Match':'"'+str(one['rowVersion'])+'"'})
        self.assertGreater(changed['rowVersion'],one['rowVersion'])
        room=data(f'/houses/{hid}/rooms',self.owner['accessToken'],{'code':'EMPTY','area':20,'capacity':3,'rentAmount':1000000,'depositAmount':0},'POST')
        self.assertEqual(404,call('/rooms/'+str(room['id']))[0])

    def test_04_chat_isolation_payload_and_read_state(self):
        post=rows(data('/posts'))[0]
        ca=data('/conversations/room-inquiries',self.a['accessToken'],{'postId':post['id']},'POST')
        cb=data('/conversations/room-inquiries',self.b['accessToken'],{'postId':post['id']},'POST')
        self.assertNotEqual(ca['id'],cb['id']);self.assertEqual(2,len(ca['participants']))
        self.assertEqual(403,call(f"/conversations/{ca['id']}/messages",self.b['accessToken'])[0])
        key=str(uuid.uuid4());payload={'type':'TEXT','content':'Private message','clientMessageKey':key}
        m=data(f"/conversations/{ca['id']}/messages",self.a['accessToken'],payload,'POST')
        retry=data(f"/conversations/{ca['id']}/messages",self.a['accessToken'],payload,'POST');self.assertEqual(m,retry)
        self.assertEqual(409,call(f"/conversations/{ca['id']}/messages",self.a['accessToken'],{**payload,'content':'Changed'},'POST')[0])
        self.assertIn(call(f"/conversations/{ca['id']}/messages",self.a['accessToken'],{'type':'IMAGE','clientMessageKey':str(uuid.uuid4())},'POST')[0],(400,422))

    def test_05_files_validate_bytes_scope_and_signed_download(self):
        image=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j9WQAAAAASUVORK5CYII=')
        file=data('/files/upload-sessions',self.a['accessToken'],{'purpose':'IDENTITY','originalName':'proof.png','mimeType':'image/png','sizeBytes':len(image),'sha256':hashlib.sha256(image).hexdigest()},'POST');fid=file['fileId']
        self.assertEqual(409,call(f'/files/{fid}/complete',self.a['accessToken'],{},'POST')[0])
        self.assertEqual(403,call(f'/files/{fid}/content',self.b['accessToken'],method='PUT',raw=image,headers={'Content-Type':'image/png'})[0])
        self.assertEqual(204,call(f'/files/{fid}/content',self.a['accessToken'],method='PUT',raw=image,headers={'Content-Type':'image/png'})[0])
        self.assertEqual('ACTIVE',data(f'/files/{fid}/complete',self.a['accessToken'],{},'POST')['status'])
        self.assertEqual(403,call(f'/files/{fid}',self.b['accessToken'])[0])
        link=data(f'/files/{fid}/download-links',self.a['accessToken'],{},'POST')['downloadUrl']
        self.assertEqual(image,call(link.removeprefix('/api/v1'))[1])
        self.assertGreaterEqual(call(link.removeprefix('/api/v1')+'bad')[0],400)

    def test_06_invoice_snapshot_patch_and_discount(self):
        contracts=rows(data('/contracts',self.owner['accessToken']))
        c=next(c for c in contracts if c['status']=='ACTIVE')
        period='2037-{:02d}-01'.format(1+int(uuid.uuid4().hex[:2],16)%12)
        # Each run uses a unique future year to keep billing-period uniqueness meaningful.
        period=f'{2100+int(uuid.uuid4().hex[:3],16)%500}-01-01'
        body={'contractId':c['id'],'billingPeriod':period,'dueDate':period,'items':[{'type':'RENT','name':'Rent','unit':'month','quantity':1,'unitPrice':1000},{'type':'DISCOUNT','name':'Discount','unit':'once','quantity':1,'unitPrice':100}]}
        invoice=data('/invoices',self.owner['accessToken'],body,'POST');self.assertEqual(float(c['rentAmount'])-100,float(invoice['total']));self.assertEqual(2,len(invoice['items']))
        patched=data('/invoices/'+str(invoice['id']),self.owner['accessToken'],{'dueDate':period[:8]+'20'},'PATCH')
        self.assertEqual(2,len(patched['items']));self.assertEqual(float(c['rentAmount'])-100,float(patched['total']))
        self.assertIn('unit',patched['items'][0]);self.assertTrue(sql('SELECT payer_snapshot IS NOT NULL FROM invoices WHERE id='+str(invoice['id']))=='1')

    def test_07_lock_revokes_sessions_and_audit_is_json(self):
        target=self.new_user();uid=target['user']['id']
        self.assertEqual(200,call(f'/admin/users/{uid}/lock',self.admin['accessToken'],{'reason':'Regression test'},'POST')[0])
        self.assertEqual(401,call('/me',target['accessToken'])[0])
        self.assertEqual('1',sql(f'SELECT JSON_VALID(after_snapshot) FROM moderation_actions WHERE target_user_id={uid} ORDER BY id DESC LIMIT 1'))

    def test_08_criteria_replace_and_accept_chat_end(self):
        for user in (self.a,self.b):
            data('/me/roommate-profile',user['accessToken'],{'housingStatus':'NO_ACCOMMODATION','availableFrom':str(TODAY),'preferredLocation':'Ha Noi','budgetMin':0,'budgetMax':10000000,'active':True},'PUT')
        criterion=data('/admin/lifestyle-criteria',self.admin['accessToken'],{'code':'reg-'+uuid.uuid4().hex[:12],'name':'Regression Boolean','category':'TEST','valueType':'BOOLEAN','allowedValues':[True,False],'active':True},'POST')
        invalid={'criteria':[{'criterionId':criterion['id'],'selfValue':{'bad':True},'preferredValue':'bad','importance':1,'isMandatory':False}]}
        self.assertIn(call('/me/roommate-profile/lifestyles',self.a['accessToken'],invalid,'PUT')[0],(400,422))
        valid={'criteria':[{'criterionId':criterion['id'],'selfValue':True,'preferredValue':False,'importance':1,'isMandatory':False}]}
        data('/me/roommate-profile/lifestyles',self.a['accessToken'],valid,'PUT');data('/me/roommate-profile/lifestyles',self.a['accessToken'],valid,'PUT')
        invite=data('/roommate-requests',self.a['accessToken'],{'receiverId':self.b['user']['id'],'scenario':'SEARCH_TOGETHER','message':'Test'},'POST')
        accepted=data(f"/roommate-requests/{invite['id']}/response",self.b['accessToken'],{'decision':'ACCEPT'},'POST');self.assertIsNotNone(accepted['conversationId'])
        cid=accepted['conversationId'];data(f"/roommate-requests/{invite['id']}/end",self.a['accessToken'],{'reason':'Finished'},'POST')
        self.assertEqual(409,call(f'/conversations/{cid}/messages',self.a['accessToken'],{'type':'TEXT','content':'Blocked','clientMessageKey':str(uuid.uuid4())},'POST')[0])

    def test_09_services_zero_price_and_template_immutability(self):
        house=rows(data('/houses',self.owner['accessToken']))[0]
        service=data(f"/houses/{house['id']}/services",self.owner['accessToken'],{'name':'reg-'+uuid.uuid4().hex[:8],'unit':'month','unitPrice':0,'calculationMethod':'PER_ROOM','active':True},'POST')
        room=house['rooms'][0]
        setting=data(f"/rooms/{room['id']}/service-settings/{service['id']}",self.owner['accessToken'],{'active':True,'unitPriceOverride':0},'PUT')
        self.assertIsNotNone(setting['id']);self.assertEqual(0,float(setting['effectiveUnitPrice']))
        template=data('/admin/contract-templates',self.admin['accessToken'],{'name':'reg-'+uuid.uuid4().hex[:8],'content':'Terms'},'POST')
        self.assertIn(call(f"/admin/contract-templates/{template['id']}",self.admin['accessToken'],{'content':'Changed'},'PATCH')[0],(400,422))

    def test_10_contract_revision_move_in_and_departure(self):
        user=self.new_user();uid=user['user']['id'];owner=self.owner['user']['id']
        room_id=int(sql(f"SELECT r.id FROM rooms r JOIN rental_houses h ON h.id=r.house_id WHERE h.landlord_id={owner} AND r.status='AVAILABLE' AND r.max_occupants>=2 AND EXISTS(SELECT id FROM posts WHERE room_id=r.id) AND EXISTS(SELECT id FROM v_effective_house_verifications v WHERE v.house_id=h.id) AND NOT EXISTS(SELECT 1 FROM contracts c WHERE c.room_id=r.id AND c.status IN ('DRAFT','PENDING_CONFIRMATION','CONFIRMED','ACTIVE')) LIMIT 1"))
        # A fixture represents an already completed appointment; all triggers remain enabled.
        hid=int(sql(f'SELECT house_id FROM rooms WHERE id={room_id}'))
        post_id=int(sql(f'SELECT id FROM posts WHERE room_id={room_id} LIMIT 1'))
        cid=int(sql(f"INSERT INTO conversations(type,room_id,post_id) VALUES ('ROOM_INQUIRY',{room_id},{post_id});SELECT LAST_INSERT_ID();"))
        sql(f"INSERT INTO conversation_participants(conversation_id,user_id,joined_at) VALUES ({cid},{uid},UTC_TIMESTAMP(6)),({cid},{owner},UTC_TIMESTAMP(6));")
        vid=int(sql(f"INSERT INTO room_viewing_requests(room_id,house_id,conversation_id,tenant_id,created_by_id,starts_at,ends_at,status,attendance_confirmed_by_id,attendance_confirmed_at,rental_decision,rental_decided_by_id,rental_decided_at) VALUES ({room_id},{hid},{cid},{uid},{owner},UTC_TIMESTAMP(6)-INTERVAL 2 HOUR,UTC_TIMESTAMP(6)-INTERVAL 1 HOUR,'COMPLETED',{owner},UTC_TIMESTAMP(6)-INTERVAL 1 HOUR,'AGREED',{uid},UTC_TIMESTAMP(6));SELECT LAST_INSERT_ID();"))
        template=rows(data('/contract-templates',self.owner['accessToken']))[0]['id']
        body={'viewingId':vid,'contractNumber':'REG-'+uuid.uuid4().hex,'startDate':str(TODAY),'endDate':str(TODAY+dt.timedelta(days=365)),'rentAmount':1000000,'depositAmount':1000000,'content':'Terms','templateId':template,'extraMembers':[{'fullName':'Later Arrival'}]}
        contract=data('/contracts',self.owner['accessToken'],body,'POST');self.assertEqual(2,len(contract['members']))
        self.assertEqual(str(template),sql('SELECT template_id FROM contract_revisions WHERE id='+str(contract['currentRevisionId'])))
        revision = rows(data(f"/contracts/{contract['id']}/revisions", user['accessToken']))[0]
        self.assertEqual(template, revision['templateId'])
        self.assertTrue(revision['templateName'])
        self.assertGreaterEqual(revision['templateVersion'], 1)
        self.assertEqual('RESERVED',sql(f'SELECT status FROM rooms WHERE id={room_id}'))
        initial=contract['currentRevisionId']
        draft=data(f"/contracts/{contract['id']}/revision-requests",user['accessToken'],{'reason':'Change terms','revisionId':initial},'POST')
        self.assertEqual('CANCELLED',sql(f'SELECT status FROM contract_revisions WHERE id={initial}'))
        data(f"/contracts/{contract['id']}/revisions/{draft['id']}",self.owner['accessToken'],{'content':'New terms'},'PATCH')
        data(f"/contracts/{contract['id']}/revisions/{draft['id']}/submit",self.owner['accessToken'],{},'POST')
        self.assertEqual(409,call(f"/contracts/{contract['id']}/confirm",user['accessToken'],{'revisionId':initial},'POST')[0])
        data(f"/contracts/{contract['id']}/confirm",user['accessToken'],{'revisionId':draft['id']},'POST')
        rep=contract['representativeRoomTenantId'];later=next(m['id'] for m in contract['members'] if m['id']!=rep)
        moved=data(f"/contracts/{contract['id']}/move-ins",self.owner['accessToken'],{'memberIds':[rep],'moveInDate':str(TODAY)},'POST')
        self.assertEqual('ACTIVE',moved['status']);self.assertEqual('PLANNED',next(m['status'] for m in moved['members'] if m['id']==later))
        data(f"/contracts/{contract['id']}/move-ins",self.owner['accessToken'],{'memberIds':[later],'moveInDate':str(TODAY)},'POST')
        data(f"/contracts/{contract['id']}/members/{later}/move-out",self.owner['accessToken'],{'moveOutDate':str(TODAY)},'POST')
        data(f"/contracts/{contract['id']}/members/{rep}/move-out",self.owner['accessToken'],{'moveOutDate':str(TODAY)},'POST')
        self.assertEqual('TERMINATED',sql(f"SELECT status FROM contracts WHERE id={contract['id']}"));self.assertEqual('AVAILABLE',sql(f'SELECT status FROM rooms WHERE id={room_id}'))


    def upload(self, user, purpose):
        image=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j9WQAAAAASUVORK5CYII=')
        file=data('/files/upload-sessions',user['accessToken'],{'purpose':purpose,'originalName':'proof.png','mimeType':'image/png','sizeBytes':len(image),'sha256':hashlib.sha256(image).hexdigest()},'POST');fid=file['fileId']
        status,body,_=call(f'/files/{fid}/content',user['accessToken'],method='PUT',raw=image,headers={'Content-Type':'image/png'})
        self.assertEqual(204,status,body);data(f'/files/{fid}/complete',user['accessToken'],{},'POST');return fid

    def paper_contract(self, user, extra=None):
        owner=self.owner['accessToken']
        hid=int(sql(f"SELECT h.id FROM rental_houses h JOIN v_effective_house_verifications v ON v.house_id=h.id WHERE h.landlord_id={self.owner['user']['id']} LIMIT 1"))
        house=data('/houses/'+str(hid),owner)
        room=data(f"/houses/{house['id']}/rooms",owner,{'code':'REG-'+uuid.uuid4().hex[:10],'area':25,'capacity':4,'rentAmount':1000000,'depositAmount':1000000},'POST')
        fid=self.upload(self.owner,'CONTRACT')
        members=[{'fullName':user['user']['fullName'],'tenantId':user['user']['id'],'representative':True,'moveInDate':str(TODAY)}]+(extra or [])
        result=data('/contract-imports',owner,{'roomId':room['id'],'paperDocumentFileId':fid,'contractNumber':'PAPER-'+uuid.uuid4().hex,'startDate':str(TODAY),'endDate':str(TODAY+dt.timedelta(days=365)),'rentAmount':1000000,'depositAmount':1000000,'content':'Signed terms','members':members},'POST')
        return data('/contracts/'+str(result['contractId']),owner)

    def test_11_paper_import_renewal_and_termination(self):
        tenant=self.new_user();c=self.paper_contract(tenant);cid=c['id']
        self.assertEqual('ACTIVE',c['status']);self.assertEqual('PAPER_IMPORT',c['source'])
        self.assertEqual(200,call('/contracts/'+str(cid),tenant['accessToken'])[0])
        revision=rows(data(f'/contracts/{cid}/revisions',tenant['accessToken']))[0]
        self.assertEqual('IMPORTED',revision['status'])
        change=data(f'/contracts/{cid}/change-requests',tenant['accessToken'],{'type':'RENEWAL','baseRevisionId':c['currentRevisionId'],'effectiveDate':str(TODAY),'newEndDate':str(TODAY+dt.timedelta(days=730)),'reason':'Renew'},'POST')
        change=data(f"/contract-change-requests/{change['id']}/decision",self.owner['accessToken'],{'decision':'APPROVE'},'POST')
        self.assertIsNotNone(change['proposedRevisionId'])
        data(f"/contract-change-requests/{change['id']}/confirm",tenant['accessToken'],{'proposedRevisionId':change['proposedRevisionId'],'proposalHash':change['proposalHash']},'POST')
        applied=data(f"/contract-change-requests/{change['id']}/apply",self.owner['accessToken'],{},'POST');self.assertEqual('COMPLETED',applied['status'])
        renewed=data(f'/contracts/{cid}',self.owner['accessToken']);self.assertEqual(str(TODAY+dt.timedelta(days=730)),renewed['endDate'])
        change=data(f'/contracts/{cid}/change-requests',tenant['accessToken'],{'type':'TERMINATION','baseRevisionId':renewed['currentRevisionId'],'effectiveDate':str(TODAY),'reason':'End lease'},'POST')
        change=data(f"/contract-change-requests/{change['id']}/decision",self.owner['accessToken'],{'decision':'APPROVE'},'POST')
        data(f"/contract-change-requests/{change['id']}/confirm",tenant['accessToken'],{'proposalHash':change['proposalHash']},'POST')
        data(f"/contract-change-requests/{change['id']}/apply",self.owner['accessToken'],{},'POST')
        self.assertEqual('TERMINATED',sql(f'SELECT status FROM contracts WHERE id={cid}'))
        self.assertEqual('0',sql(f"SELECT COUNT(*) FROM room_tenants WHERE contract_id={cid} AND status IN ('PLANNED','ACTIVE')"))

    def test_12_join_consents_handover_and_new_representative(self):
        tenant=self.new_user();applicant=self.new_user();c=self.paper_contract(tenant);cid=c['id']
        join=data('/occupant-join-requests',tenant['accessToken'],{'contractId':cid,'applicantId':applicant['user']['id'],'plannedMoveInDate':str(TODAY),'message':'Join'},'POST')
        data(f"/occupant-join-requests/{join['id']}/consents",tenant['accessToken'],{'consent':True},'POST')
        data(f"/occupant-join-requests/{join['id']}/consents",applicant['accessToken'],{'consent':True},'POST')
        data(f"/occupant-join-requests/{join['id']}/approve",self.owner['accessToken'],{},'POST')
        completed=data(f"/occupant-join-requests/{join['id']}/complete",self.owner['accessToken'],{},'POST');next_member=completed['member']['id']
        self.assertEqual(str(TODAY),completed['member']['moveInDate'])
        data(f'/contracts/{cid}/representative-handovers',self.owner['accessToken'],{'departingMemberId':c['representativeRoomTenantId'],'successorMemberId':next_member,'reason':'Handover','consentRecorded':True},'POST')
        history=rows(data(f'/contracts/{cid}/representative-history',self.owner['accessToken']));self.assertGreaterEqual(len(history),2)
        current=data(f'/contracts/{cid}',applicant['accessToken']);self.assertEqual(applicant['user']['id'],current['representativeTenantId'])
        self.assertEqual(403,call(f'/contracts/{cid}/change-requests',tenant['accessToken'],{'type':'TERMINATION','baseRevisionId':current['currentRevisionId'],'effectiveDate':str(TODAY),'reason':'Old representative'},'POST')[0])

    def test_13_verification_proofs_and_role_grant(self):
        tenant=self.new_user();fid=self.upload(tenant,'IDENTITY')
        verification=data('/me/landlord-verifications',tenant['accessToken'],{'identityNumber':str(100000000000+int(uuid.uuid4().hex[:6],16)),'identityFileId':fid},'POST')
        self.assertEqual(200,call(f'/files/{fid}',self.admin['accessToken'])[0])
        self.assertEqual(422,call(f"/admin/landlord-verifications/{verification['id']}/decision",self.admin['accessToken'],{'decision':'APPROVE'},'POST')[0])
        data(f"/admin/landlord-verifications/{verification['id']}/decision",self.admin['accessToken'],{'decision':'APPROVE','evidenceChecked':True},'POST')
        self.assertIn('LANDLORD',data('/me',tenant['accessToken'])['roles'])
        house=data('/houses',tenant['accessToken'],{'name':'Verified House','address':'Test address','provinceCode':'01'},'POST')
        proof=self.upload(tenant,'LANDLORD_PROOF')
        verification=data(f"/houses/{house['id']}/verifications",tenant['accessToken'],{'rightType':'OWNER','scopeDescription':'Entire house','validFrom':str(TODAY),'documents':[{'fileId':proof,'documentType':'OWNER_PROOF'}]},'POST')
        self.assertTrue(verification['documents'])
        data(f"/admin/house-verifications/{verification['id']}/decision",self.admin['accessToken'],{'decision':'APPROVE','evidenceChecked':True},'POST')
        self.assertTrue(data(f"/houses/{house['id']}/rental-right",tenant['accessToken'])['effective'])
        data(f"/admin/house-verifications/{verification['id']}/revoke",self.admin['accessToken'],{'reason':'Revoke for test'},'POST')
        self.assertFalse(data(f"/houses/{house['id']}/rental-right",tenant['accessToken'])['effective'])

    def test_14_notifications_cutoff_and_monotonic_read(self):
        uid=self.a['user']['id'];key='reg-'+uuid.uuid4().hex
        nid=int(sql(f"INSERT INTO notifications(user_id,type,title,content,event_key) VALUES ({uid},'TEST','Test','Test','{key}');SELECT LAST_INSERT_ID();"))
        data('/me/notifications/read-all',self.a['accessToken'],{'throughCreatedAt':'2000-01-01T00:00:00Z'},'POST')
        self.assertEqual('0',sql(f'SELECT is_read FROM notifications WHERE id={nid}'))
        first=data(f'/me/notifications/{nid}/read-state',self.a['accessToken'],{'isRead':True},'PUT')
        at=sql(f'SELECT read_at FROM notifications WHERE id={nid}')
        data(f'/me/notifications/{nid}/read-state',self.a['accessToken'],{'isRead':True},'PUT')
        self.assertEqual(at,sql(f'SELECT read_at FROM notifications WHERE id={nid}'))

    def test_15_report_catalogue_payload_and_target_scope(self):
        post=rows(data('/posts'))[0]
        report=data('/reports',self.a['accessToken'],{'type':'VIOLATION','targetType':'POST','targetId':post['id'],'reason':'Check target'},'POST')
        decision=data(f"/admin/reports/{report['id']}/decision",self.admin['accessToken'],{'decision':'RESOLVE','resolution':'Resolved test'},'POST')
        self.assertEqual('RESOLVED',decision['status'])
        self.assertIn(call('/reports',self.a['accessToken'],{'type':'DISPUTE','targetType':'CONTRACT','targetId':1,'reason':'Unauthorized'},'POST')[0],(403,404))


    def test_16_transfer_between_houses_keeps_all_members(self):
        tenant=self.new_user();c=self.paper_contract(tenant,[{'fullName':'Planned Arrival','representative':False}]);cid=c['id']
        house=data('/houses',self.owner['accessToken'],{'name':'Transfer target','address':'Different house','provinceCode':'01'},'POST')
        fid=self.upload(self.owner,'LANDLORD_PROOF')
        proof=data(f"/houses/{house['id']}/verifications",self.owner['accessToken'],{'rightType':'OWNER','scopeDescription':'Whole house','validFrom':str(TODAY),'documents':[{'fileId':fid,'documentType':'OWNER_PROOF'}]},'POST')
        data(f"/admin/house-verifications/{proof['id']}/decision",self.admin['accessToken'],{'decision':'APPROVE','evidenceChecked':True},'POST')
        room=data(f"/houses/{house['id']}/rooms",self.owner['accessToken'],{'code':'T1','capacity':3,'area':30,'rentAmount':2000000,'depositAmount':2000000},'POST')
        options=rows(data(f'/contracts/{cid}/transfer-options',tenant['accessToken']));self.assertIn(room['id'],[option['roomId'] for option in options])
        change=data(f'/contracts/{cid}/change-requests',tenant['accessToken'],{'type':'TRANSFER','baseRevisionId':c['currentRevisionId'],'targetRoomId':room['id'],'effectiveDate':str(TODAY),'reason':'Move to another house','proposal':{'content':'New room terms','endDate':c['endDate']}},'POST')
        change=data(f"/contract-change-requests/{change['id']}/decision",self.owner['accessToken'],{'decision':'APPROVE'},'POST')
        data(f"/contract-change-requests/{change['id']}/confirm",tenant['accessToken'],{'proposalHash':change['proposalHash']},'POST')
        sql(f"UPDATE rooms SET rent_price=2100000 WHERE id={room['id']}")
        applied=data(f"/contract-change-requests/{change['id']}/apply",self.owner['accessToken'],{},'POST')
        target=data('/contracts/'+str(applied['resultContractId']),tenant['accessToken'])
        self.assertEqual(2,len(target['members']));self.assertEqual(room['id'],target['roomId']);self.assertEqual('TERMINATED',sql(f'SELECT status FROM contracts WHERE id={cid}'))
        self.assertEqual(2000000, float(target['rentAmount']))

    def test_17_refresh_rotation_and_password_reset_grant(self):
        tenant=self.new_user();old=tenant['refreshToken']
        rotated=data('/auth/refresh',body={},method='POST',headers={'Refresh-Token':old});self.assertTrue(rotated['refreshToken']);self.assertNotEqual(old,rotated['refreshToken'])
        self.assertEqual(401,call('/auth/refresh',body={},method='POST',headers={'Refresh-Token':old})[0])
        reset=data('/auth/password-resets',body={'identifier':tenant['user']['email']},method='POST')
        inbox=Path(os.getenv('VERIFICATION_LOCAL_INBOX') or Path(__file__).resolve().parents[2]/'.cache/review-inbox')
        delivery=next(file.read_text(encoding='utf-8') for file in inbox.glob('*.txt') if ('target='+tenant['user']['email']) in file.read_text(encoding='utf-8'))
        code=delivery.split('code=')[1].strip()
        grant=data('/auth/password-resets/verify',body={'selector':reset['selector'],'code':code},method='POST')['resetGrant']
        data('/auth/password-resets/complete',body={'resetGrant':grant,'newPassword':'Changed-password-123'},method='POST')
        self.assertEqual(401,call('/me',rotated['accessToken'])[0])
        self.assertTrue(data('/auth/login',body={'identifier':tenant['user']['email'],'password':'Changed-password-123'},method='POST')['accessToken'])

    def test_18_concurrent_room_inquiry_is_singleton(self):
        from concurrent.futures import ThreadPoolExecutor
        tenant=self.new_user();post=rows(data('/posts'))[0]
        with ThreadPoolExecutor(max_workers=6) as pool:
            conversations=list(pool.map(lambda _:data('/conversations/room-inquiries',tenant['accessToken'],{'postId':post['id']},'POST'),range(6)))
        self.assertEqual(1,len({conversation['id'] for conversation in conversations}))
        self.assertTrue(all(len(conversation['participants'])==2 for conversation in conversations))

    def test_19_chat_read_cursor_and_transaction_rollback(self):
        tenant=self.new_user();owner_id=self.owner['user']['id']
        post_id=sql(f"SELECT p.id FROM v_public_house_posts p JOIN rooms r ON r.id=p.room_id WHERE p.landlord_id={owner_id} AND p.availability_status='OPEN' AND p.availability_expires_at>UTC_TIMESTAMP(6) AND r.status='AVAILABLE' LIMIT 1")
        conversation=data('/conversations/room-inquiries',tenant['accessToken'],{'postId':post_id},'POST');cid=conversation['id']
        first=data(f'/conversations/{cid}/messages',self.owner['accessToken'],{'type':'TEXT','content':'One','clientMessageKey':str(uuid.uuid4())},'POST')['message']
        second=data(f'/conversations/{cid}/messages',self.owner['accessToken'],{'type':'TEXT','content':'Two','clientMessageKey':str(uuid.uuid4())},'POST')['message']
        cursor=data(f'/conversations/{cid}/read-state',tenant['accessToken'],{'lastReadMessageId':second['id']},'PUT')
        old=data(f'/conversations/{cid}/read-state',tenant['accessToken'],{'lastReadMessageId':first['id']},'PUT');self.assertEqual(cursor['lastReadAt'],old['lastReadAt']);self.assertEqual(0,old['unreadCount'])
        uid=tenant['user']['id'];self.assertEqual(second['id'],sql(f'SELECT last_message_id FROM api_conversation_read_cursors WHERE conversation_id={cid} AND user_id={uid}'))
        before=sql(f'SELECT COUNT(*) FROM chat_messages WHERE conversation_id={cid}')
        self.assertEqual(422,call(f'/conversations/{cid}/messages',tenant['accessToken'],{'type':'IMAGE','clientMessageKey':str(uuid.uuid4()),'fileIds':['999999999']},'POST')[0])
        self.assertEqual(before,sql(f'SELECT COUNT(*) FROM chat_messages WHERE conversation_id={cid}'))

    def test_20_profile_and_settings_types(self):
        tenant=self.new_user();token=tenant['accessToken']
        self.assertEqual(422,call('/me/profile',token,{'fullName':{'bad':True}},'PATCH')[0])
        self.assertEqual(422,call('/me/profile',token,{'role':'ADMIN'},'PATCH')[0])
        data('/me/profile',token,{'fullName':'Updated profile','bio':'Typed input'},'PATCH')
        self.assertEqual(422,call('/me/notification-settings',token,{'inAppEnabled':'yes'},'PATCH')[0])
        data('/me/notification-settings',token,{'inAppEnabled':False},'PATCH')
        me=data('/me',token);self.assertEqual('Updated profile',me['fullName']);self.assertFalse(me['settings']['inAppEnabled']);self.assertNotIn('ADMIN',me['roles'])

    def test_21_landlord_post_filters_use_local_creation_dates(self):
        owner = self.owner['accessToken']
        post = rows(data('/landlord/posts?pageSize=1', owner))[0]
        sql(f"UPDATE posts SET created_at='2026-10-24 17:00:00' WHERE id={post['id']}")
        filters = f"houseId={post['houseId']}&roomId={post['roomId']}"
        included = rows(data(f'/landlord/posts?{filters}&createdFrom=2026-10-25&createdTo=2026-10-25', owner))
        self.assertIn(post['id'], [row['id'] for row in included])
        excluded = rows(data(f'/landlord/posts?{filters}&createdTo=2026-10-24', owner))
        self.assertNotIn(post['id'], [row['id'] for row in excluded])
        self.assertEqual(422, call('/landlord/posts?createdFrom=2026-10-26&createdTo=2026-10-24', owner)[0])

    def test_22_renewal_requires_confirmation_of_the_amended_proposal(self):
        tenant = self.new_user()
        tenant_token = tenant['accessToken']
        contract = self.paper_contract(tenant)
        contract_url = f"/contracts/{contract['id']}"
        change = data(f"{contract_url}/change-requests", tenant_token, {
            'type': 'RENEWAL', 'baseRevisionId': contract['currentRevisionId'], 'effectiveDate': str(TODAY),
            'newEndDate': str(TODAY + dt.timedelta(days=730)), 'reason': 'Renew', 'acceptUnchangedProposal': True,
        }, 'POST')
        owner = self.owner['accessToken']
        url = f"/contract-change-requests/{change['id']}"
        new_end = str(TODAY + dt.timedelta(days=750))
        self.assertIsNone(change['tenantConfirmedAt'])
        self.assertEqual(409, call(f'{url}/decision', owner, {'decision': 'APPROVE', 'proposalHash': 'old'}, 'POST')[0])
        approved = data(f'{url}/decision', owner, {
            'decision': 'APPROVE', 'proposalHash': change['proposalHash'], 'amendment': {'newEndDate': new_end},
        }, 'POST')
        self.assertEqual('APPROVED_WAITING_CONFIRMATION', approved['status'])
        self.assertIsNone(approved['tenantConfirmedAt'])
        self.assertEqual(new_end, json.loads(approved['proposalSnapshot'])['newEndDate'])
        self.assertEqual(str(TODAY + dt.timedelta(days=730)),
                         json.loads(approved['proposalSnapshot'])['originalRequest']['newEndDate'])
        self.assertEqual(approved['proposalHash'], data(url, tenant_token)['proposalHash'])
        self.assertEqual(409, call(f'{url}/apply', owner, {}, 'POST')[0])
        self.assertEqual(409, call(f'{url}/confirm', tenant_token, {
            'proposalHash': change['proposalHash'], 'proposedRevisionId': approved['proposedRevisionId'],
        }, 'POST')[0])
        confirmed = data(f'{url}/confirm', tenant_token, {
            'proposalHash': approved['proposalHash'], 'proposedRevisionId': approved['proposedRevisionId'],
        }, 'POST')
        self.assertEqual('READY_TO_APPLY', confirmed['status'])
        self.assertEqual(contract['currentRevisionId'], data(contract_url, owner)['currentRevisionId'])
        self.assertEqual('COMPLETED', data(f'{url}/apply', owner, {}, 'POST')['status'])
        self.assertEqual(new_end, data(contract_url, owner)['endDate'])

    def test_23_contact_invite_can_be_accepted_without_a_roommate_connection(self):
        tenant, applicant, stranger = (self.new_user() for _ in range(3))
        contract = self.paper_contract(tenant)
        body = {'contractId': contract['id'], 'applicantContact': applicant['user']['email'],
                'plannedMoveInDate': str(TODAY), 'representativeConsent': True}
        join = data('/occupant-join-requests', tenant['accessToken'], body, 'POST')
        url = f"/occupant-join-requests/{join['id']}"
        self.assertTrue(join['representativeConsented'])
        self.assertFalse(join['applicantConsented'])
        self.assertEqual(409, call('/occupant-join-requests', tenant['accessToken'], body, 'POST')[0])
        self.assertEqual(403, call(f'{url}/consents', stranger['accessToken'], {'consent': True}, 'POST')[0])
        invitation = next(row for row in rows(data('/occupant-join-requests', applicant['accessToken'])) if row['id'] == join['id'])
        self.assertEqual(contract['contractNumber'], invitation['contractNumber'])
        self.assertEqual('PENDING_LANDLORD', data(f'{url}/consents', applicant['accessToken'], {'consent': True}, 'POST')['status'])
        self.assertEqual('APPROVED', data(f'{url}/approve', self.owner['accessToken'], {}, 'POST')['status'])
        result = data(f'{url}/complete', self.owner['accessToken'], {}, 'POST')
        self.assertEqual(applicant['user']['id'], result['member']['tenantId'])

    def test_24_service_invoice_preview_inherits_only_published_previous_readings(self):
        tenant = self.new_user()
        contract = self.paper_contract(tenant)
        owner = self.owner['accessToken']
        house, room = contract['houseId'], contract['roomId']
        service_ids = {}
        for name, unit, method, price in (
            ('Điện kiểm thử', 'kWh', 'METERED', 4000),
            ('Internet kiểm thử', 'phòng', 'PER_ROOM', 150000),
            ('Vệ sinh kiểm thử', 'người', 'PER_PERSON', 10000),
        ):
            service = data(f'/houses/{house}/services', owner, {
                'name': name, 'unit': unit, 'calculationMethod': method, 'unitPrice': price,
            }, 'POST')
            applied = data(f"/rooms/{room}/service-settings/{service['id']}", owner, {
                'active': True, **({'unitPriceOverride': 3500} if method == 'METERED' else {}),
            }, 'PUT')
            service_ids[method] = applied['id']
        period = TODAY.replace(day=1)
        next_period = (period + dt.timedelta(days=32)).replace(day=1)
        url = f"/contracts/{contract['id']}/invoice-preview"
        self.assertEqual(403, call(f'{url}?billingPeriod={period}', tenant['accessToken'])[0])

        def quote(month):
            return data(f'{url}?billingPeriod={month}', owner)

        def meter(preview):
            return next(row for row in preview['services'] if row['calculationMethod'] == 'METERED')

        def body(month, preview, current, previous=None):
            lines = [{'type': 'RENT'}]
            for method, service_id in service_ids.items():
                line = {'type': 'SERVICE', 'roomServiceId': service_id}
                if method == 'METERED':
                    line['currentReading'] = current
                    if previous is not None:
                        line['previousReading'] = previous
                lines.append(line)
            return {'contractId': contract['id'], 'billingPeriod': str(month), 'dueDate': str(month + dt.timedelta(days=7)),
                    'payerRoomTenantId': preview['defaultPayerId'], 'previewVersion': preview['previewVersion'], 'items': lines}

        first = quote(period)
        self.assertIsNone(meter(first)['previousReading'])
        self.assertEqual(422, call('/invoices', owner, body(period, first, 120), 'POST')[0])
        draft = data('/invoices', owner, body(period, first, 120, 100), 'POST')
        self.assertIsNone(meter(quote(next_period))['previousReading'])
        data(f"/invoices/{draft['id']}/issue", owner, {}, 'POST')

        preview = quote(next_period)
        self.assertEqual(120, Decimal(str(meter(preview)['previousReading'])))
        self.assertEqual(str(period), meter(preview)['previousBillingPeriod'])
        self.assertEqual(3500, Decimal(str(meter(preview)['unitPrice'])))
        self.assertEqual(422, call('/invoices', owner, body(next_period, preview, 119), 'POST')[0])
        incomplete = body(next_period, preview, 150)
        incomplete['items'].pop()
        self.assertEqual(422, call('/invoices', owner, incomplete, 'POST')[0])

        data(f"/invoices/{draft['id']}/cancel", owner, {'reason': 'Chỉ số cần duyệt lại'}, 'POST')
        self.assertIsNone(meter(quote(next_period))['previousReading'])
        self.assertEqual(409, call('/invoices', owner, body(next_period, preview, 150), 'POST')[0])
        replacement = data(f"/invoices/{draft['id']}/replacements", owner, body(period, first, 120, 100), 'POST')
        data(f"/invoices/{replacement['id']}/issue", owner, {}, 'POST')

        current = data('/invoices', owner, body(next_period, quote(next_period), 150), 'POST')
        charges = {row['calculationMethod']: row for row in current['items'] if row['type'] == 'SERVICE'}
        self.assertEqual((120, 150, 30, 105000), tuple(Decimal(str(charges['METERED'][key])) for key in (
            'previousReading', 'currentReading', 'quantity', 'amount')))
        self.assertEqual(150000, Decimal(str(charges['PER_ROOM']['amount'])))
        self.assertEqual(10000, Decimal(str(charges['PER_PERSON']['amount'])))
        self.assertEqual(1265000, Decimal(str(current['total'])))

if __name__=='__main__':unittest.main(verbosity=2)
