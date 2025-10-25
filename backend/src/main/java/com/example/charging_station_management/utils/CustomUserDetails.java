package com.example.charging_station_management.utils;

import com.example.charging_station_management.entity.converters.User;
import com.example.charging_station_management.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Data
@AllArgsConstructor
public class CustomUserDetails implements UserDetails {
    private int id;
    private String email;
    private String name;
    private String password;
    private String phone;
    private Role role;

    public static CustomUserDetails build(User user) {
        return new CustomUserDetails(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getPassword(),
                user.getPhone(),
                user.getRole()
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

}