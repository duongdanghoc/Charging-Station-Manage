package com.example.charging_station_management.repository.specification;

import com.example.charging_station_management.entity.converters.Station;
import com.example.charging_station_management.entity.enums.VehicleType;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class StationSpecification {

    public static Specification<Station> filterStations(Integer vendorId, String search, Integer status,
            VehicleType type) {
        return (root, query, cb) -> {
            Specification<Station> spec = Specification.where(null);

            // 1. Luôn lọc theo Vendor ID
            if (vendorId != null) {
                spec = spec.and((root2, query2, cb2) -> cb2.equal(root2.get("vendor").get("id"), vendorId));
            }

            // 2. Lọc theo Search Text (Name hoặc Address)
            if (StringUtils.hasText(search)) {
                String likePattern = "%" + search.toLowerCase() + "%";
                spec = spec.and((root2, query2, cb2) -> cb2.or(
                        cb2.like(cb2.lower(root2.get("name")), likePattern),
                        cb2.like(cb2.lower(root2.get("location").get("addressDetail")), likePattern),
                        cb2.like(cb2.lower(root2.get("location").get("province")), likePattern)));
            }

            // 3. Lọc theo Status (1: Active, 0: Inactive)
            if (status != null) {
                spec = spec.and((root2, query2, cb2) -> cb2.equal(root2.get("status"), status));
            } else {
                // MẶC ĐỊNH: Không hiển thị trạm đã xóa (status != -1)
                spec = spec.and((root2, query2, cb2) -> cb2.notEqual(root2.get("status"), -1));
            }

            // 4. Lọc theo Type
            if (type != null) {
                spec = spec.and((root2, query2, cb2) -> cb2.equal(root2.get("type"), type));
            }

            return spec.toPredicate(root, query, cb);
        };
    }
}
