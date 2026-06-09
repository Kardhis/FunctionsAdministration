package com.example.backend.auth;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import org.junit.jupiter.api.Test;

class TokenHashingTest {

  private static final String PEPPER = "unit-test-pepper-32-chars-minimum!!";
  private static final String RAW_TOKEN = "raw-reset-token-value";

  @Test
  void sha256HexIsDeterministic() {
    String first = TokenHashing.sha256Hex(PEPPER, RAW_TOKEN);
    String second = TokenHashing.sha256Hex(PEPPER, RAW_TOKEN);

    assertThat(first).isEqualTo(second);
    assertThat(first).hasSize(64).matches("[0-9a-f]+");
    assertThat(first).isEqualTo(expectedSha256Hex(PEPPER, RAW_TOKEN));
  }

  @Test
  void sha256HexChangesWhenInputChanges() {
    String baseline = TokenHashing.sha256Hex(PEPPER, RAW_TOKEN);

    assertThat(TokenHashing.sha256Hex(PEPPER, "other-token")).isNotEqualTo(baseline);
    assertThat(TokenHashing.sha256Hex("other-pepper", RAW_TOKEN)).isNotEqualTo(baseline);
  }

  private static String expectedSha256Hex(String pepper, String rawToken) {
    try {
      MessageDigest md = MessageDigest.getInstance("SHA-256");
      md.update(pepper.getBytes(StandardCharsets.UTF_8));
      md.update((byte) '|');
      md.update(rawToken.getBytes(StandardCharsets.UTF_8));
      return HexFormat.of().formatHex(md.digest());
    } catch (Exception e) {
      throw new IllegalStateException(e);
    }
  }
}
