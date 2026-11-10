package com.troday.api.repository;
import com.troday.api.entity.RoomServiceSetting; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface RoomServiceSettingRepository extends JpaRepository<RoomServiceSetting,Long>{List<RoomServiceSetting> findByRoomId(Long roomId); Optional<RoomServiceSetting> findByRoomIdAndHouseServiceId(Long roomId,Long houseServiceId);}
