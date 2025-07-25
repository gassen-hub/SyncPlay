package com.playsync3.repos;

import com.playsync3.entities.TestScreenshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import com.playsync3.entities.TestScreenshot;
import com.playsync3.entities.ScreenshotType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestScreenshotRepository extends JpaRepository<TestScreenshot, Long> {

    List<TestScreenshot> findByTestResultIdOrderByCreatedAtDesc(Long testResultId);

    List<TestScreenshot> findByTestResultIdAndScreenshotType(Long testResultId, ScreenshotType screenshotType);

    void deleteByTestResultId(Long testResultId);

    // New query for getting screenshots by script IDs
    @Query("SELECT ts FROM TestScreenshot ts WHERE ts.testResultId IN " +
            "(SELECT tr.id FROM TestResult tr WHERE tr.scriptId IN :scriptIds) " +
            "ORDER BY ts.createdAt DESC")
    List<TestScreenshot> findByScriptIds(@Param("scriptIds") List<Long> scriptIds);
}
