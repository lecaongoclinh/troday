package com.troday.api.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;

@Service
public class TokenAttempts {
    private final JdbcTemplate jdbc;
    public TokenAttempts(JdbcTemplate jdbc){this.jdbc=jdbc;}
    @Transactional(propagation=Propagation.REQUIRES_NEW)
    public void failed(Long id){jdbc.update("UPDATE verification_tokens SET attempt_count=LEAST(max_attempts,attempt_count+1) WHERE id=?",id);}
}
