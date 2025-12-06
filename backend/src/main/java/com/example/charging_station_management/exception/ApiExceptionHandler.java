package com.example.charging_station_management.exception;

import com.example.charging_station_management.dto.BaseApiResponse;
import com.example.charging_station_management.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@RequiredArgsConstructor
public class ApiExceptionHandler {

    private final MessageSource messageSource;

    private String getMessage(String message, Object... args) {
        return messageSource.getMessage(message, args, LocaleContextHolder.getLocale());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<BaseApiResponse<ErrorResponse>> handleResourceNotFoundException(
            ResourceNotFoundException ex, HttpServletRequest request) {
        
        String errorTitle = getMessage("error.title.resource.not.found");
        String errorMessage = getMessage(ex.getMessage(), ex.getArgs());
        
        return buildErrorResponse(HttpStatus.NOT_FOUND, errorTitle, errorMessage, request, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<BaseApiResponse<ErrorResponse>> handleValidationExceptions(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        
        Map<String, String> validationErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            validationErrors.put(error.getField(), error.getDefaultMessage())
        );

        String errorTitle = getMessage("error.title.validation.failed");
        String errorMessage = getMessage("error.validation.failed");

        return buildErrorResponse(HttpStatus.BAD_REQUEST, errorTitle, errorMessage, request, validationErrors);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<BaseApiResponse<ErrorResponse>> handleBadCredentialsException(
            BadCredentialsException ex, HttpServletRequest request) {
            
        String errorTitle = getMessage("error.title.auth.failed");
        String errorMessage = getMessage("error.bad.credentials");

        return buildErrorResponse(HttpStatus.UNAUTHORIZED, errorTitle, errorMessage, request, null);
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<BaseApiResponse<ErrorResponse>> handleAccessDeniedException(
            AccessDeniedException ex, HttpServletRequest request) {
            
        String errorTitle = getMessage("error.title.access.denied");
        String errorMessage = getMessage("error.access.denied");
        
        return buildErrorResponse(HttpStatus.FORBIDDEN, errorTitle, errorMessage, request, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<BaseApiResponse<ErrorResponse>> handleGeneralException(
            Exception ex, HttpServletRequest request) {
        
        String errorTitle = getMessage("error.title.unexpected");
        String errorMessage = getMessage("error.unexpected");
        
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, errorTitle, errorMessage, request, null);
    }
    
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<BaseApiResponse<ErrorResponse>> handleIllegalStateException(
        IllegalStateException ex, HttpServletRequest request) {

        String errorTitle = getMessage("error.title.illegal.state");
        String errorMessage = getMessage("error.illegal.state");

        return buildErrorResponse(HttpStatus.CONFLICT, errorTitle, errorMessage, request, null);
    }

    // ==============
    // HELPER METHOD 
    // ==============

    /**
     * Phương thức xây dựng error response.
     * @param status HttpStatus code
     * @param errorTitle Tiêu đề lỗi 
     * @param errorMessage Thông điệp lỗi chi tiết
     * @param request Request gây ra lỗi
     * @param validationErrors Map chứa các lỗi validation (có thể null)
     * @return ResponseEntity 
     */
    private ResponseEntity<BaseApiResponse<ErrorResponse>> buildErrorResponse(
            HttpStatus status, String errorTitle, String errorMessage, HttpServletRequest request, Map<String, String> validationErrors) {

        ErrorResponse errorResponse;
        if (validationErrors != null && !validationErrors.isEmpty()) {
            errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                errorMessage,
                request.getRequestURI(),
                validationErrors
            );
        } else {
            errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                errorMessage,
                request.getRequestURI()
            );
        }

        BaseApiResponse<ErrorResponse> apiResponse = new BaseApiResponse<>(
                status.value(),
                errorResponse,
                errorTitle
        );

        return new ResponseEntity<>(apiResponse, status);
    }
}
