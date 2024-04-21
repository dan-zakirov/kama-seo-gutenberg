<?php
/**
 * Plugin Name: Kama SEO Tags Gutenberg Integration
 * Description: Easily edit SEO meta fields like title, description, and more directly within the Gutenberg editor with our plugin, 'Kama SEO Tags Gutenberg Integration.' Streamline your SEO workflow and boost your website's visibility effortlessly.
 * Requires at least: 6.1
 * Requires PHP: 7.0
 * Version: 0.1.0
 * Author: Dan Zakirov
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: kst-gi
 *
 * @package kst-gi
 */

defined( 'ABSPATH' ) || exit;

/**
 * Plugin text domain
 */
function kst_gi_load_textdomain() {
    load_plugin_textdomain( 'kst-gi', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
}

add_action( 'plugins_loaded', 'kst_gi_load_textdomain' );

/**
 * Enqueue Gutenberg
 */
function kst_gi_enqueue_block_editor_assets() {
    $kama_seo_gutenberg = plugin_dir_path( __FILE__ ) . 'build/kama-seo.asset.php';

    if ( file_exists( $kama_seo_gutenberg ) ) {
        $assets = include $kama_seo_gutenberg;

        $kama_seo_tags_initialized = class_exists( 'Kama_SEO_Tags' );

        wp_enqueue_style(
            'style-kama-seo',
            plugin_dir_url( __FILE__ ) . 'build/style-kama-seo.css',
            array(),
            $assets['version']
        );

        wp_enqueue_script(
            'kama-seo',
            plugin_dir_url( __FILE__ ) . 'build/kama-seo.js',
            $assets['dependencies'],
            $assets['version'],
            true
        );

        wp_set_script_translations( 'kama-seo', 'kst-gi', plugin_dir_path( __FILE__ ) . 'languages' );

        wp_localize_script(
            'kama-seo',
            'kst_gi_data',
            array(
                'kama_seo_tags_initialized' => $kama_seo_tags_initialized,
            )
        );

    }
}
add_action( 'enqueue_block_editor_assets', 'kst_gi_enqueue_block_editor_assets' );

/**
 * Initialize custom post meta field.
 */
function kst_gi_init_post_meta_field() {
    $post_types = get_post_types(array('show_in_rest' => true), 'names');

    foreach ($post_types as $post_type) {
        register_post_meta(
            $post_type,
            'title',
            array(
                'show_in_rest' => true,
                'single'       => true,
                'type'         => 'string',
            )
        );
        register_post_meta(
            $post_type,
            'description',
            array(
                'show_in_rest' => true,
                'single'       => true,
                'type'         => 'string',
            )
        );
        register_post_meta(
            $post_type,
            'keywords',
            array(
                'show_in_rest' => true,
                'single'       => true,
                'type'         => 'string',
            )
        );
        register_post_meta(
            $post_type,
            'robots',
            array(
                'show_in_rest' => true,
                'single'       => true,
                'type'         => 'string',
            )
        );
    }

    if (!get_option('seo_keywords_enabled')) {
        add_option('seo_keywords_enabled', '0', '', 'no');
    }

    register_setting(
        'general',
        'seo_keywords_enabled',
        array(
            'show_in_rest' => true,
            'type'         => 'boolean',
            'default'      => false
        )
    );

}

add_action('init', 'kst_gi_init_post_meta_field');