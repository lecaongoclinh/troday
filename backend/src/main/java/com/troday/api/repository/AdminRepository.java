package com.troday.api.repository;
import com.troday.api.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AdminRepository extends JpaRepository<Admin, Long> { }
