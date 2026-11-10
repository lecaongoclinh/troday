package com.troday.api.repository;
import com.troday.api.entity.InvoiceItem; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem,Long>{List<InvoiceItem> findByInvoiceIdOrderByPosition(Long invoiceId); void deleteByInvoiceId(Long invoiceId);}
