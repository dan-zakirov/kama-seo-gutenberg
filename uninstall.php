<?php

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

if (is_multisite()) {
    $sites = get_sites();

    foreach ($sites as $site) {
        switch_to_blog($site->blog_id);

        delete_option('seo_keywords_enabled');

        restore_current_blog();
    }
} else {
    delete_option('seo_keywords_enabled');
}