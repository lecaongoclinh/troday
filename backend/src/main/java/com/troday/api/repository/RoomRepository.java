package com.troday.api.repository;
import com.troday.api.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface RoomRepository extends JpaRepository<Room, Long> { List<Room> findByHouseId(Long houseId); }
