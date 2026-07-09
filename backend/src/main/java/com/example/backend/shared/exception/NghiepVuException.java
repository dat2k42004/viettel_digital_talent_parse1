package com.example.backend.shared.exception;

import lombok.Getter;

@Getter
public class NghiepVuException extends RuntimeException {
    private final int code;
    private final Object[] args;

    public NghiepVuException(String message, int code) {
        super(message);
        this.code = code;
        this.args = null;
    }

    public NghiepVuException(String message, int code, Object... args) {
        super(message);
        this.code = code;
        this.args = args;
    }
}
