package com.aireporting.backend.repository;

import com.aireporting.backend.entity.Organization;
import com.aireporting.backend.entity.UploadedFile;
import com.aireporting.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UploadedFileRepository extends JpaRepository<UploadedFile, Long> {
   // List<UploadedFile> findByUserOrderByUploadedAtDesc(User user);

    List<UploadedFile> findByOrganizationOrderByUploadedAtDesc(Organization organization);
    List<UploadedFile> findByOrganizationId(Long organizationId);


}