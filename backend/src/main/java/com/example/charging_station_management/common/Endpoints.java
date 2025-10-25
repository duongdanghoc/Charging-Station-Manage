package com.example.charging_station_management.common;

public final class Endpoints {

    private Endpoints() {}

    private static final String API_BASE = "/api/v1";

    public static final class Auth {
        private Auth() {}
        public static final String BASE_URL = API_BASE + "/auth";
        public static final String REGISTER = "/register";
        public static final String LOGIN = "/login";
        public static final String REFRESH = "/refresh";
        public static final String LOGOUT = "/logout";
    }

    public static final class Admin {
        private Admin() {}
        public static final String BASE_URL = API_BASE + "/admin";
        public static final String ALL_PATHS = BASE_URL + "/**";
    }
    
    public static final class Vendor {
        private Vendor() {}
        public static final String BASE_URL = API_BASE + "/vendor";
        public static final String ALL_PATHS = BASE_URL + "/**";
    }

    public static final class Customer {
        private Customer() {}
        public static final String BASE_URL = API_BASE + "/customer";
        public static final String ALL_PATHS = BASE_URL + "/**";
    }
}
