package com.troday.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Component
public class ExpiryWorker {
    private final DomainSupport domain;
    private final IntegrationService files;
    @Value("${troday.jobs.enabled:true}") private boolean enabled;
    public ExpiryWorker(DomainSupport domain,IntegrationService files){this.domain=domain;this.files=files;}
    @Scheduled(fixedDelayString="${troday.jobs.interval-ms:60000}",initialDelay=60000)
    @Transactional public void expire(){
        if(!enabled)return;
        domain.jdbc.update("UPDATE room_viewing_proposals SET status='EXPIRED',expired_at=UTC_TIMESTAMP(6) WHERE status='PENDING' AND starts_at<=UTC_TIMESTAMP(6)");
        domain.jdbc.update("UPDATE occupant_join_requests SET status='EXPIRED' WHERE status='APPROVED' AND hold_expires_at<=UTC_TIMESTAMP(6)");
        domain.jdbc.update("UPDATE contract_change_requests SET status='EXPIRED' WHERE status='APPROVED_WAITING_CONFIRMATION' AND expires_at<=UTC_TIMESTAMP(6)");
        domain.jdbc.update("UPDATE invoices SET status='OVERDUE' WHERE status='UNPAID' AND due_date<DATE(UTC_TIMESTAMP()+INTERVAL 7 HOUR)");
        domain.jdbc.update("UPDATE auth_sessions SET revoked_at=UTC_TIMESTAMP(6),revocation_reason='EXPIRED' WHERE revoked_at IS NULL AND expires_at<=UTC_TIMESTAMP(6)");
        // No hard deletion of evidence, stay histories, contracts or active sessions.
        for(Long id:domain.jdbc.queryForList("SELECT id FROM files WHERE status='STAGED' AND expires_at<=UTC_TIMESTAMP(6)",Long.class))
            if(!files.referenced(id))domain.jdbc.update("UPDATE files SET status='DELETED',deleted_at=UTC_TIMESTAMP(6) WHERE id=? AND report_id IS NULL AND chat_message_id IS NULL AND landlord_verification_id IS NULL",id);
    }
}
