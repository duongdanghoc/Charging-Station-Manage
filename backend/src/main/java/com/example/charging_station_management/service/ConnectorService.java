package com.example.charging_station_management.service;

import com.example.charging_station_management.dto.request.CreateConnectorRequest;
import com.example.charging_station_management.dto.request.UpdateConnectorRequest;
import com.example.charging_station_management.dto.response.ConnectorDetailResponse;
import com.example.charging_station_management.dto.response.ConnectorResponse;
import com.example.charging_station_management.entity.enums.ConnectorStatus;
import com.example.charging_station_management.entity.enums.ConnectorType;

import java.util.List;

public interface ConnectorService {

    ConnectorResponse createConnector(Integer vendorId, CreateConnectorRequest request);
    ConnectorResponse updateConnector(Integer vendorId, Integer connectorId, UpdateConnectorRequest request);
    ConnectorResponse updateConnectorStatus(Integer vendorId, Integer connectorId, ConnectorStatus status);
    void deleteConnector(Integer vendorId, Integer connectorId);
    ConnectorDetailResponse getConnectorDetail(Integer vendorId, Integer connectorId);
    List<ConnectorResponse> getAllConnectorsByVendor(Integer vendorId);
    List<ConnectorResponse> searchConnectors(
            Integer vendorId,
            ConnectorType connectorType,
            ConnectorStatus status,
            Integer poleId);
    void validateConnectorInfo(CreateConnectorRequest request);
}