package com.troday.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.nio.file.*;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

/** Development inbox is opt-in. Production must configure an actual delivery adapter. */
@Component
public class VerificationDelivery {
    @Value("${troday.verification.local-inbox:}") private String inbox;
    @Value("${troday.verification.delivery-url:}") private String deliveryUrl;
    @Value("${troday.verification.delivery-token:}") private String deliveryToken;
    private final com.fasterxml.jackson.databind.ObjectMapper mapper;
    public VerificationDelivery(com.fasterxml.jackson.databind.ObjectMapper mapper){this.mapper=mapper;}
    public void deliver(Long user,String target,String purpose,String code) {
        if(!deliveryUrl.isBlank()){
            try{
                var uri=java.net.URI.create(deliveryUrl);
                if(!"https".equals(uri.getScheme()) && !("http".equals(uri.getScheme()) && java.util.Set.of("localhost","127.0.0.1").contains(uri.getHost())))throw new IllegalArgumentException();
                var builder=java.net.http.HttpRequest.newBuilder(uri).timeout(java.time.Duration.ofSeconds(10)).header("Content-Type","application/json");
                if(!deliveryToken.isBlank())builder.header("Authorization","Bearer "+deliveryToken);
                var request=builder.POST(java.net.http.HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(java.util.Map.of("userId",user,"target",target,"purpose",purpose,"code",code)))).build();
                var response=java.net.http.HttpClient.newBuilder().connectTimeout(java.time.Duration.ofSeconds(5)).build().send(request,java.net.http.HttpResponse.BodyHandlers.discarding());
                if(response.statusCode()<200||response.statusCode()>299)throw new java.io.IOException();return;
            }catch(Exception e){if(e instanceof InterruptedException)Thread.currentThread().interrupt();throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Không gửi được mã xác minh");}
        }
        if(inbox.isBlank())throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Chưa cấu hình dịch vụ gửi mã xác minh");
        try {
            Path folder=Path.of(inbox).toAbsolutePath().normalize();Files.createDirectories(folder);
            Files.writeString(folder.resolve(UUID.randomUUID()+".txt"),"userId="+user+"\ntarget="+target+"\npurpose="+purpose+"\ncode="+code,StandardCharsets.UTF_8,StandardOpenOption.CREATE_NEW);
        } catch(java.io.IOException e){throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Không gửi được mã xác minh");}
    }
}
