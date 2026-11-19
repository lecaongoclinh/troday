package com.troday.api.service;

import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.support.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.BooleanSupplier;

@Component
public class RealtimeHub {
    private record Subscription(Long user,SseEmitter emitter,BooleanSupplier authorized) {}
    private final Set<Subscription> subscriptions=ConcurrentHashMap.newKeySet();
    public SseEmitter connect(Long user,BooleanSupplier authorized){
        SseEmitter emitter=new SseEmitter(600_000L);Subscription s=new Subscription(user,emitter,authorized);subscriptions.add(s);
        emitter.onCompletion(()->subscriptions.remove(s));emitter.onTimeout(()->subscriptions.remove(s));emitter.onError(e->subscriptions.remove(s));
        send(s,"connected",null,Map.of("type","connected"));return emitter;
    }
    public void publish(Long user,String event,String id,Object value){
        Runnable send=()->subscriptions.stream().filter(s->s.user().equals(user)).forEach(s->send(s,event,id,value));
        if(TransactionSynchronizationManager.isSynchronizationActive())TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization(){public void afterCommit(){send.run();}});
        else send.run();
    }
    @Scheduled(fixedDelay=25000) public void heartbeat(){subscriptions.forEach(s->{if(!s.authorized().getAsBoolean()){s.emitter().complete();subscriptions.remove(s);}else send(s,"heartbeat",null,Map.of("type","heartbeat"));});}
    private void send(Subscription s,String event,String id,Object data){try{var e=SseEmitter.event().name(event).data(data);if(id!=null)e.id(id);s.emitter().send(e);}catch(Exception e){subscriptions.remove(s);s.emitter().complete();}}
}
