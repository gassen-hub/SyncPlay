package com.playsync3;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling  // Add this annotation

public class PlaySync3Application {

    public static void main(String[] args) {
        SpringApplication.run(PlaySync3Application.class, args);
    }

}
