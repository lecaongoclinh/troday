package com.troday.api.repository;
import com.troday.api.entity.RentalServiceCatalog; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface RentalServiceCatalogRepository extends JpaRepository<RentalServiceCatalog,Long>{Optional<RentalServiceCatalog> findByNameIgnoreCase(String name);}
