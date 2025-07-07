package com.playsync3.repos;

import com.playsync3.entities.Schedule;
import com.playsync3.entities.ScheduleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByScriptId(Long scriptId);

    List<Schedule> findByStatus(ScheduleStatus status);

    @Query("SELECT s FROM Schedule s WHERE s.status = 'ACTIVE' AND s.nextExecution <= :currentTime")
    List<Schedule> findSchedulesToExecute(@Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT s FROM Schedule s WHERE s.status = 'ACTIVE'")
    List<Schedule> findActiveSchedules();

    boolean existsByNameAndScriptId(String name, Long scriptId);
}
