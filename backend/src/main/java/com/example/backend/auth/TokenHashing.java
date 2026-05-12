package com.example.backend.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

final class TokenHashing {

  private TokenHashing() {}

  static String sha256Hex(String pepper, String rawToken) {
    try {
      MessageDigest md = MessageDigest.getInstance("SHA-256");
      md.update(pepper.getBytes(StandardCharsets.UTF_8));
      md.update((byte) '|');
      md.update(rawToken.getBytes(StandardCharsets.UTF_8));
      return HexFormat.of().formatHex(md.digest());
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException("SHA-256 not available", e);
    }
  }
}
