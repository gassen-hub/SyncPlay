package com.playsync3.repos;

import com.playsync3.entities.GeneratedScript;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GeneratedScriptRepository extends JpaRepository<GeneratedScript, Long> {
    Optional<GeneratedScript> findByTestcaseId(Long testcaseId);
    void deleteByTestcaseId(Long testcaseId);
}
