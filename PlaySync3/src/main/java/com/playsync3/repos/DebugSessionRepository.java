package com.playsync3.repos;

import com.playsync3.entities.DebugSession;
import com.playsync3.entities.DebugStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DebugSessionRepository extends JpaRepository<DebugSession, Long> {
    Optional<DebugSession> findBySessionId(String sessionId);
    List<DebugSession> findByTestcaseId(Long testcaseId);
    List<DebugSession> findByStatus(DebugStatus status);
    List<DebugSession> findByUserSession(String userSession);
    void deleteBySessionId(String sessionId);
}
