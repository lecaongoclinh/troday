package com.troday.api.repository;
import com.troday.api.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ContractRepository extends JpaRepository<Contract, Long> { }
