package com.troday.api.repository;
import com.troday.api.entity.ContractTemplate; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ContractTemplateRepository extends JpaRepository<ContractTemplate,Long>{List<ContractTemplate> findByActiveTrueOrderByNameAscVersionDesc(); Optional<ContractTemplate> findTopByNameOrderByVersionDesc(String name);}
