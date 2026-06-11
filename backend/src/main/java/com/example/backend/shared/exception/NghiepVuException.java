package com.example.backend.shared.exception;

import lombok.Getter;

@Getter
public class NghiepVuException extends RuntimeException {
    private final int code;

    public NghiepVuException(String message, int code) {
        super(message);
        this.code = code;
    }
}
