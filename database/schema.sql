-- database/schema.sql

CREATE DATABASE IF NOT EXISTS instagram_saas;
USE instagram_saas;

-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    company VARCHAR(200),
    plan ENUM('free', 'starter', 'pro', 'business', 'enterprise') DEFAULT 'free',
    status ENUM('active', 'suspended', 'pending') DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    sales_count INT DEFAULT 0,
    max_sales INT DEFAULT 10,
    total_posts INT DEFAULT 0,
    max_posts_per_month INT DEFAULT 20,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires BIGINT,
    last_login_at BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Instagram Accounts
CREATE TABLE instagram_accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    ig_user_id VARCHAR(255) NOT NULL,
    ig_username VARCHAR(100),
    ig_name VARCHAR(200),
    profile_picture_url TEXT,
    followers_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    media_count INT DEFAULT 0,
    account_type ENUM('personal', 'business', 'creator') DEFAULT 'business',
    access_token TEXT NOT NULL,
    token_expires_at BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    is_primary BOOLEAN DEFAULT FALSE,
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_ig_user (ig_user_id)
);

-- Posts/Creator Content
CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    ig_account_id INT NOT NULL,
    creator_id INT,
    title VARCHAR(500),
    media_url TEXT,
    media_type ENUM('image', 'video', 'carousel_album', 'reel') DEFAULT 'image',
    thumbnail_url TEXT,
    caption TEXT,
    hashtags TEXT,
    location_id VARCHAR(100),
    location_name VARCHAR(200),
    product_tags JSON,
    scheduled_at BIGINT,
    published_at BIGINT,
    status ENUM('draft', 'scheduled', 'processing', 'published', 'failed', 'cancelled') DEFAULT 'draft',
    ig_media_id VARCHAR(255),
    ig_container_id VARCHAR(255),
    permalink VARCHAR(500),
    caption_id VARCHAR(255),
    like_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    reach INT DEFAULT 0,
    impressions INT DEFAULT 0,
    saved INT DEFAULT 0,
    video_views INT DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    error_message TEXT,
    error_code VARCHAR(50),
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ig_account_id) REFERENCES instagram_accounts(id) ON DELETE CASCADE
);

-- Stories
CREATE TABLE stories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    ig_account_id INT NOT NULL,
    media_url TEXT NOT NULL,
    media_type ENUM('image', 'video') DEFAULT 'image',
    background_color VARCHAR(7) DEFAULT '#000000',
    sticker_text VARCHAR(500),
    sticker_emoji VARCHAR(100),
    sticker_position_x DECIMAL(5,2) DEFAULT 50.00,
    sticker_position_y DECIMAL(5,2) DEFAULT 50.00,
    link_url VARCHAR(500),
    mentions VARCHAR(500),
    hashtags VARCHAR(500),
    mentions_config JSON,
    stickers_config JSON,
    scheduled_at BIGINT,
    published_at BIGINT,
    status ENUM('draft', 'scheduled', 'processing', 'published', 'failed') DEFAULT 'draft',
    ig_story_id VARCHAR(255),
    view_count INT DEFAULT 0,
    reply_count INT DEFAULT 0,
    link_click_count INT DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ig_account_id) REFERENCES instagram_accounts(id) ON DELETE CASCADE
);

-- Carousel Items
CREATE TABLE carousel_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    media_url TEXT NOT NULL,
    media_type ENUM('image', 'video') DEFAULT 'image',
    caption TEXT,
    order_index INT DEFAULT 0,
    product_tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Comments
CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    ig_comment_id VARCHAR(255) NOT NULL,
    ig_user_id VARCHAR(255),
    username VARCHAR(100),
    profile_picture_url TEXT,
    text TEXT,
    text_translated TEXT,
    media_url TEXT,
    like_count INT DEFAULT 0,
    sentiment ENUM('positive', 'negative', 'neutral') DEFAULT 'neutral',
    is_auto_replied BOOLEAN DEFAULT FALSE,
    auto_reply_text TEXT,
    auto_reply_status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    is_hidden BOOLEAN DEFAULT FALSE,
    is_spam BOOLEAN DEFAULT FALSE,
    replied_at BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_ig_comment (ig_comment_id)
);

-- Auto-Replies Rules
CREATE TABLE auto_reply_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    ig_account_id INT,
    name VARCHAR(200),
    trigger_keywords JSON NOT NULL,
    trigger_type ENUM('contains', 'exact', 'starts_with', 'ends_with', 'regex') DEFAULT 'contains',
    auto_reply_text TEXT NOT NULL,
    reply_type ENUM('text', 'comment', 'dm', 'both') DEFAULT 'comment',
    is_active BOOLEAN DEFAULT TRUE,
    is_case_sensitive BOOLEAN DEFAULT FALSE,
    reply_delay_seconds INT DEFAULT 0,
    skip_already_replied BOOLEAN DEFAULT TRUE,
    use_smart_response BOOLEAN DEFAULT FALSE,
    response_variants JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Followers/Following
CREATE TABLE followers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ig_account_id INT NOT NULL,
    ig_user_id VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    profile_picture_url TEXT,
    full_name VARCHAR(200),
    bio TEXT,
    website VARCHAR(500),
    is_business BOOLEAN DEFAULT FALSE,
    category VARCHAR(100),
    media_count INT DEFAULT 0,
    followers_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    last_fetched_at BIGINT,
    last_interacted_at BIGINT,
    interaction_score DECIMAL(5,2) DEFAULT 0.00,
    tags JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ig_account_id) REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_follower (ig_account_id, ig_user_id)
);

-- Direct Messages
CREATE TABLE dm_campaigns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    ig_account_id INT NOT NULL,
    name VARCHAR(200),
    message_type ENUM('text', 'image', 'template') DEFAULT 'text',
    message_text TEXT,
    media_url TEXT,
    template_config JSON,
    target_type ENUM('followers', 'following', 'list', 'hashtag', 'location') DEFAULT 'followers',
    target_filter JSON,
    delay_between_messages INT DEFAULT 30,
    max_messages INT DEFAULT 50,
    status ENUM('draft', 'scheduled', 'running', 'paused', 'completed', 'failed') DEFAULT 'draft',
    started_at BIGINT,
    completed_at BIGINT,
    total_recipients INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    delivered_count INT DEFAULT 0,
    read_count INT DEFAULT 0,
    error_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ig_account_id) REFERENCES instagram_accounts(id) ON DELETE CASCADE
);

CREATE TABLE dm_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    campaign_id INT NOT NULL,
    recipient_ig_user_id VARCHAR(255) NOT NULL,
    message_text TEXT,
    media_url TEXT,
    ig_message_id VARCHAR(255),
    status ENUM('pending', 'sent', 'delivered', 'read', 'failed') DEFAULT 'pending',
    sent_at BIGINT,
    delivered_at BIGINT,
    read_at BIGINT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES dm_campaigns(id) ON DELETE CASCADE
);

-- Pricing Plans
CREATE TABLE plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2) NOT NULL,
    discount_percentage INT DEFAULT 0,
    max_instagram_accounts INT DEFAULT 1,
    max_posts_per_month INT DEFAULT 30,
    max_stories_per_month INT DEFAULT 100,
    max_sales INT DEFAULT 100,
    max_auto_replies INT DEFAULT 50,
    max_dm_per_day INT DEFAULT 50,
    can_schedule_posts BOOLEAN DEFAULT TRUE,
    can_schedule_stories BOOLEAN DEFAULT TRUE,
    can_auto_reply BOOLEAN DEFAULT FALSE,
    can_dm_automation BOOLEAN DEFAULT FALSE,
    can_analytics BOOLEAN DEFAULT FALSE,
    can_hashtag_suggestions BOOLEAN DEFAULT FALSE,
    can_multi_account BOOLEAN DEFAULT FALSE,
    can_team_members BOOLEAN DEFAULT FALSE,
    can_api_access BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE,
    stripe_price_id_monthly VARCHAR(255),
    stripe_price_id_yearly VARCHAR(255),
    stripe_product_id VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Transactions & Sales
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan_id INT,
    transaction_type ENUM('subscription', 'one_time', 'upgrade', 'downgrade', 'renewal', 'refund') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method ENUM('card', 'paypal', 'bank', 'crypto') DEFAULT 'card',
    stripe_payment_intent_id VARCHAR(255),
    stripe_invoice_id VARCHAR(255),
    status ENUM('pending', 'completed', 'failed', 'refunded', 'disputed') DEFAULT 'pending',
    billing_period_start BIGINT,
    billing_period_end BIGINT,
    promo_code VARCHAR(50),
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE sales (
    id INT PRIMARY KEY AUTO