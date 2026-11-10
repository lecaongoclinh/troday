package com.troday.api.repository;
import com.troday.api.entity.FileAsset; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface FileAssetRepository extends JpaRepository<FileAsset,Long>{List<FileAsset> findByOwnerUserIdOrderByIdDesc(Long ownerUserId);}
