package com.playsync3.repos;

import com.playsync3.entities.ScheduleHistory;
import com.playsync3.entities.ScheduleHistoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScheduleHistoryRepository extends JpaRepository<ScheduleHistory, Long> {

    List<ScheduleHistory> findByScheduleIdOrderByCreatedAtDesc(Long scheduleId);

    List<ScheduleHistory> findByScheduleIdAndTypeOrderByCreatedAtDesc(Long scheduleId, ScheduleHistoryType type);

    @Query("SELECT sh FROM ScheduleHistory sh WHERE sh.type = 'EXECUTION' AND sh.createdAt >= :fromDate ORDER BY sh.createdAt DESC")
    List<ScheduleHistory> findRecentExecutions(@Param("fromDate") LocalDateTime fromDate);

    void deleteByScheduleId(Long scheduleId);
}