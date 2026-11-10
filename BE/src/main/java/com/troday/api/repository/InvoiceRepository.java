package com.troday.api.repository;
import com.troday.api.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate; import java.util.*;
public interface InvoiceRepository extends JpaRepository<Invoice, Long> { List<Invoice> findByContractId(Long contractId); Optional<Invoice> findByContractIdAndBillingPeriodAndStatusNot(Long contractId, LocalDate period, String status); }
