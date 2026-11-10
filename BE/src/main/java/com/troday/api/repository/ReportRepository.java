package com.troday.api.repository;
import com.troday.api.entity.Report; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ReportRepository extends JpaRepository<Report,Long>{List<Report> findByReporterIdOrderByIdDesc(Long reporterId); List<Report> findByStatusOrderByIdAsc(String status);}
