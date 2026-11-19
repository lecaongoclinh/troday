package com.troday.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@org.springframework.scheduling.annotation.EnableScheduling
@SpringBootApplication
public class TrodayApplication {
    public static void main(String[] args) {
        SpringApplication.run(TrodayApplication.class, args);
    }
}
