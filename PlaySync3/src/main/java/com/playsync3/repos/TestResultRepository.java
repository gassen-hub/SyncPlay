package com.playsync3.repos;

import com.playsync3.entities.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import com.playsync3.entities.TestResult;
import com.playsync3.entities.TestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TestResultRepository extends JpaRepository<TestResult, Long> {

    List<TestResult> findByScriptIdOrderByCreatedAtDesc(Long scriptId);

    // New analytics queries
    @Query("SELECT tr.status, COUNT(tr) FROM TestResult tr WHERE tr.createdAt >= :startDate AND tr.createdAt <= :endDate GROUP BY tr.status")
    List<Object[]> getExecutionStatsByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT AVG(tr.executionTime) FROM TestResult tr WHERE tr.createdAt >= :startDate AND tr.createdAt <= :endDate")
    Double getAverageExecutionTime(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("""
        SELECT gs.testcaseId, tc.name, COUNT(tr), 
               SUM(CASE WHEN tr.status = 'PASSED' THEN 1 ELSE 0 END),
               SUM(CASE WHEN tr.status = 'FAILED' THEN 1 ELSE 0 END),
               AVG(tr.executionTime), MAX(tr.createdAt)
        FROM TestResult tr 
        JOIN GeneratedScript gs ON tr.scriptId = gs.id 
        JOIN Testcase tc ON gs.testcaseId = tc.id
        WHERE tr.createdAt >= :startDate AND tr.createdAt <= :endDate
        GROUP BY gs.testcaseId, tc.name
        ORDER BY COUNT(tr) DESC
        """)
    List<Object[]> getTestCaseExecutionStats(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("""
        SELECT tc.name, COUNT(tr), 
               SUM(CASE WHEN tr.status = 'PASSED' THEN 1 ELSE 0 END),
               SUM(CASE WHEN tr.status = 'FAILED' THEN 1 ELSE 0 END),
               AVG(tr.executionTime), MAX(tr.createdAt)
        FROM TestResult tr 
        JOIN GeneratedScript gs ON tr.scriptId = gs.id 
        JOIN Testcase tc ON gs.testcaseId = tc.id
        WHERE gs.testcaseId = :testcaseId 
        AND tr.createdAt >= :startDate AND tr.createdAt <= :endDate
        GROUP BY tc.name
        """)
    Object[] getTestCaseExecutionStatsByTestcaseId(@Param("testcaseId") Long testcaseId,
                                                   @Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate);
}

