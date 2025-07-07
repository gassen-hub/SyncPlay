package com.playsync3.repos;

import com.playsync3.entities.Testcase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestcaseRepository extends JpaRepository<Testcase, Long> {
    boolean existsByName(String name);
}
