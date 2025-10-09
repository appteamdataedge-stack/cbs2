package com.example.moneymarket.repository;

import com.example.moneymarket.entity.GLSetup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GLSetupRepository extends JpaRepository<GLSetup, String> {
    
    List<GLSetup> findByLayerId(Integer layerId);
    
    List<GLSetup> findByParentGLNum(String parentGLNum);
    
    Optional<GLSetup> findByGlNumStartingWith(String glNumPrefix);
    
    @Query("SELECT g FROM GLSetup g WHERE g.layerId = ?1 AND g.layerGLNum = ?2")
    Optional<GLSetup> findByLayerIdAndLayerGLNum(Integer layerId, String layerGLNum);
    
    @Query("SELECT g FROM GLSetup g WHERE g.parentGLNum = ?1 ORDER BY g.layerGLNum")
    List<GLSetup> findChildGLsByParentGLNumOrderByLayerGLNum(String parentGLNum);
    
    List<GLSetup> findByGlName(String glName);
    
    // Validation queries for GL consistency
    long countByLayerGLNum(String layerGLNum);
    
    long countByGlNameAndParentGLNum(String glName, String parentGLNum);
}
