package com.example.backend;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

class ModulithTest {

    @Test
    void verifyModulith() {
        ApplicationModules.of("com.example.backend.modules").verify();
    }
}
