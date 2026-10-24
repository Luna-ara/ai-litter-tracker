declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    OPENAI_API_KEY?: string;
    OPENAI_VISION_MODEL?: string;
    GOVERNMENT_USER_IDS?: string;
    BOUNTY_IMAGE_ORIGINS?: string;
    BUCKET?: R2Bucket;
  }
}
