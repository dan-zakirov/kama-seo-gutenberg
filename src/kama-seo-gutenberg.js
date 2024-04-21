/**
 * WordPress dependencies
 */

import './style.scss';

let kamaSEOTagsInitialized = kst_gi_data.kama_seo_tags_initialized;

import { __ } from '@wordpress/i18n';
import {registerPlugin} from '@wordpress/plugins';
import {PluginSidebar, PluginSidebarMoreMenuItem} from '@wordpress/edit-post';

import {
    TextControl,
    TextareaControl,
    ToggleControl,
    Tooltip,
    Icon,
    PanelBody,
    Button,
    Modal,
    Spinner
} from '@wordpress/components';

import {useSelect} from '@wordpress/data';
import {useEntityProp} from '@wordpress/core-data';
import {useState, useEffect} from '@wordpress/element';
import {help, postList} from '@wordpress/icons';

const SeoIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" width="800px" height="800px" viewBox="0 0 32 32" id="icon">
        <title>term</title>
        <path d="M28,26H25V24h3V8H25V6h3a2.0023,2.0023,0,0,1,2,2V24A2.0027,2.0027,0,0,1,28,26Z"/>
        <circle cx="23" cy="16" r="2"/>
        <circle cx="16" cy="16" r="2"/>
        <circle cx="9" cy="16" r="2"/>
        <path d="M7,26H4a2.0023,2.0023,0,0,1-2-2V8A2.002,2.002,0,0,1,4,6H7V8H4V24H7Z"/>
        <rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" className="cls-1" width="32"
              height="32" fill="none" />
    </svg>
);

const SaveIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M18.1716 1C18.702 1 19.2107 1.21071 19.5858 1.58579L22.4142 4.41421C22.7893 4.78929 23 5.29799 23 5.82843V20C23 21.6569 21.6569 23 20 23H4C2.34315 23 1 21.6569 1 20V4C1 2.34315 2.34315 1 4 1H18.1716ZM4 3C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21L5 21L5 15C5 13.3431 6.34315 12 8 12L16 12C17.6569 12 19 13.3431 19 15V21H20C20.5523 21 21 20.5523 21 20V6.82843C21 6.29799 20.7893 5.78929 20.4142 5.41421L18.5858 3.58579C18.2107 3.21071 17.702 3 17.1716 3H17V5C17 6.65685 15.6569 8 14 8H10C8.34315 8 7 6.65685 7 5V3H4ZM17 21V15C17 14.4477 16.5523 14 16 14L8 14C7.44772 14 7 14.4477 7 15L7 21L17 21ZM9 3H15V5C15 5.55228 14.5523 6 14 6H10C9.44772 6 9 5.55228 9 5V3Z" fill="#0F0F0F"/>
    </svg>
);

const MetaBlockField = () => {

    const {postType, postId} = useSelect(
        (select) => {
            return {
                postType: select('core/editor').getCurrentPostType(),
                postId: select('core/editor').getCurrentPostId(),
            };
        },
        []
    );

    const [meta, setMeta] = useEntityProp('postType', postType, 'meta', postId);
    const [isOpen, setOpen] = useState(false);
    const [titleLength, setTitleLength] = useState(0);
    const [descriptionLength, setDescriptionLength] = useState(0);

    const openModal = () => {
        setOpen(true);

        // Получаем длину title и description
        setTitleLength(meta.title.length);
        setDescriptionLength(meta.description.length);
    };

    const closeModal = () => setOpen(false);
    const updateSettings = () => {
        const isDirty = wp.data.select('core/editor').isEditedPostDirty();
        if (isDirty) {
            wp.data.dispatch('core/editor').savePost();
        } else {
            console.log('No changes to save.');
        }
    };

    const filledText = __('filled', 'kst-gi');
    const notFilledText = __('not filled', 'kst-gi');
    const indexText = __('indexed', 'kst-gi');

    // Начальное состояние для seoKeywordsEnabled и loading
    const [seoKeywordsEnabled, setSeoKeywordsEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (meta) {
            const initialStatus = {
                title: meta.title ? filledText : notFilledText,
                description: meta.description ? filledText : notFilledText,
                keywords: meta.keywords ? filledText : notFilledText,
                robots: meta.robots.includes('noindex') ? 'noindex, nofollow' : indexText,
            };
            setStatus(initialStatus);

            // Retrieve the value of the option 'seo_keywords_enabled' from the database.
            wp.apiFetch({path: '/wp/v2/settings'}).then((settings) => {
                setSeoKeywordsEnabled(settings.seo_keywords_enabled);
                setLoading(false);
            });

        }
    }, [meta]);

    const isDirty = wp.data.select('core/editor').isEditedPostDirty();

    const [status, setStatus] = useState({
        title: notFilledText,
        description: notFilledText,
        keywords: notFilledText,
        robots: indexText,
    });

    const updateStatus = (newStatus) => {
        setStatus(newStatus);
    };

    const handleTitleChange = (newValue) => {
        setMeta({...meta, title: newValue});
        updateStatus({...status, title: newValue ? filledText : notFilledText});
        setTitleLength(newValue.length);
    };

    const handleDescriptionChange = (newValue) => {
        setMeta({...meta, description: newValue});
        updateStatus({...status, description: newValue ? filledText : notFilledText});
        setDescriptionLength(newValue.length);
    };

    const handleKeywordsChange = (newValue) => {
        if (seoKeywordsEnabled) {
            setMeta({...meta, keywords: newValue});
            updateStatus({...status, keywords: newValue ? filledText : notFilledText});
        } else {
            setMeta({...meta, keywords: ""});
            updateStatus({...status, keywords: notFilledText});
        }
    };

    const handleRobotsChange = (newValue) => {
        const updatedRobots = newValue ? ['noindex', 'nofollow'] : [];
        setMeta({...meta, robots: updatedRobots.join(',')});
        updateStatus({...status, robots: newValue ? 'noindex, nofollow' : indexText});
    };

    const toggleSeoKeywords = (newValue) => {
        setSeoKeywordsEnabled(newValue);
        wp.apiFetch({
            path: '/wp/v2/settings',
            method: 'POST',
            data: {seo_keywords_enabled: newValue},
        }).then((response) => {
            console.log('Опция обновлена', response.seo_keywords_enabled);
        }).catch((error) => {
            console.error('Ошибка при обновлении опции', error);
        });
    };

    return (
        <PanelBody title={__('Settings SEO Tags', 'kst-gi')}>

            {kamaSEOTagsInitialized ? (
                <>
                    <div className="air-kst__susses">
                        <p>
                            <svg xmlns="http://www.w3.org/2000/svg" width="100px" height="100px" viewBox="0 0 24 24"
                                 fill="none">
                                <path d="M9 16C9.85038 16.6303 10.8846 17 12 17C13.1154 17 14.1496 16.6303 15 16"
                                      stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
                                <ellipse cx="15" cy="10.5" rx="1" ry="1.5" fill="#1C274C"/>
                                <ellipse cx="9" cy="10.5" rx="1" ry="1.5" fill="#1C274C"/>
                                <path
                                    d="M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C21.5093 4.43821 21.8356 5.80655 21.9449 8"
                                    stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                            {__('Kama SEO Tags initialized!', 'kst-gi')}
                        </p>
                    </div>

                    <p>{__('Click the button below to modify SEO description!', 'kst-gi')}</p>

                    <Button className="button button-primary button-hero air-kst__btn-seo" variant="primary" onClick={openModal}>
                        <Icon icon={postList}/>
                        {__('Modify SEO Settings', 'kst-gi')}
                    </Button>

                    <div className="air-kst__keywords">
                        {loading ? (
                            <Spinner/>
                        ) : (
                            <ToggleControl
                                label={
                                    <>
                                        {__('Enable SEO Keywords', 'kst-gi')}
                                        <Tooltip className="air-kst__tooltip" delay={0} placement="left"
                                                 text={__('The "keywords" meta tag is not considered by Google and most modern search engines as a ranking factor. Today, the emphasis is on the quality and relevance of content. So, the use of the "keywords" meta tag is not mandatory, and it\'s more important to focus on creating high-quality and relevant content for users. However, some older and less popular search engines may still consider this tag.', 'kst-gi')}>
									<span className="air-kst__tooltip-span">
									  <Icon icon={help}/>
									</span>
                                        </Tooltip>
                                    </>
                                }
                                checked={seoKeywordsEnabled}
                                onChange={toggleSeoKeywords}
                            />
                        )}
                    </div>

                    {isOpen && (

                        <Modal title={__('Kama SEO Tags', 'kst-gi')} size="medium" onRequestClose={closeModal}>

                            <TextControl
                                __next40pxDefaultSize
                                label={__("SEO Title", "kst-gi")}
                                placeholder={__("Enter a concise and catchy title for SEO", "kst-gi")}
                                value={meta.title}
                                onChange={handleTitleChange}
                                rows="2"
                            />

                            <p className="air-kst__help air-kst__title">
                                {__("Ideally, it should be under ", "kst-gi")}
                                <span className={titleLength > 60 ? 'air-kst__max' : 'air-kst__norm'}>
                                    {titleLength}/60
                                </span>
                                {__(" characters.", "kst-gi")}
                            </p>

                            <hr/>

                            <TextareaControl
                                label={__("SEO Description", "kst-gi")}
                                placeholder={__("Provide a brief and relevant description of the content", "kst-gi")}
                                value={meta.description}
                                onChange={handleDescriptionChange}
                                rows="2"
                            />


                            <p className="air-kst__help air-kst__description">
                                {__("Aim for ", "kst-gi")}
                                <span className={descriptionLength > 160 ? 'air-kst__max' : 'air-kst__norm'}>
                                    {descriptionLength}/160
                                </span>
                                {__(" characters or less.", "kst-gi")}
                            </p>

                            <hr/>
                            {seoKeywordsEnabled && (
                                <>
                                    <TextareaControl
                                        label={__("SEO Keywords", "kst-gi")}
                                        placeholder={__("Enter relevant keywords separated by commas", "kst-gi")}
                                        value={meta.keywords}
                                        onChange={handleKeywordsChange}
                                        className="air-kst__textarea"
                                        rows="2"
                                    />
                                    <p className="air-kst__help">{__("Choose words or phrases that users might search for.", "kst-gi")}</p>
                                </>
                            )}

                            <ToggleControl
                                label={__("SEO Robots (noindex)", "kst-gi")}
                                checked={meta.robots.includes('noindex')}
                                onChange={handleRobotsChange}
                                className="air-kst__check"
                            />

                            <Button
                                variant="secondary"
                                onClick={updateSettings}
                                disabled={!isDirty}
                                className="button button-primary button-hero is-primary air-kst__save"
                            >
                                <Icon icon={SaveIcon}/>
                                {__('Save fields', 'kst-gi')}
                            </Button>

                        </Modal>
                    )}

                    <div className="air-kst__block-status">
                        <hr/>
                        <h2>{__('SEO Description Status', 'kst-gi')}</h2>
                        <p><b>{__('SEO Title', 'kst-gi')}:</b> <span
                            className={`air-kst__${status.title === filledText ? 'yes' : 'no'}`}>{status.title}</span>
                        </p>
                        <p><b>{__('SEO Description', 'kst-gi')}:</b> <span
                            className={`air-kst__${status.description === filledText ? 'yes' : 'no'}`}>{status.description}</span>
                        </p>
                        {seoKeywordsEnabled && (
                            <p><b>{__('SEO Keywords', 'kst-gi')}:</b> <span
                                className={`air-kst__${status.keywords === filledText ? 'yes' : 'no'}`}>{status.keywords}</span>
                            </p>
                        )}
                        <p><b>{__('Indexing', 'kst-gi')}:</b> <span
                            className={`air-kst__${status.robots === indexText ? 'yes' : 'no'}`}>{status.robots}</span>
                        </p>
                    </div>

                </>
            ) : (
                <div className="air-kst__error">

                    <svg xmlns="http://www.w3.org/2000/svg" width="100px" height="100px" viewBox="0 0 24 24"
                         fill="none">
                        <path d="M9 17C9.85038 16.3697 10.8846 16 12 16C13.1154 16 14.1496 16.3697 15 17"
                              stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
                        <ellipse cx="15" cy="10.5" rx="1" ry="1.5" fill="#1C274C"/>
                        <ellipse cx="9" cy="10.5" rx="1" ry="1.5" fill="#1C274C"/>
                        <path
                            d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z"
                            stroke="#1C274C" stroke-width="1.5"/>
                    </svg>

                    <h3>
                        {__('We did not detect the Kama_SEO_Tags class in use.', 'kst-gi')}
                    </h3>

                    <p>
                        {__('Make sure the class is installed and initialized.', 'kst-gi')}
                    </p>

                    <p>
                        {__('You can find more details in this article', 'kst-gi')} <a
                        href={__('https://wp-kama.com/2320/seo-meta-tags-without-plugins', 'kst-gi')}
                        target="_blank">{__('here', 'kst-gi')}</a>.
                    </p>

                    <p>
                        {__('Also, make sure you have initialized the ', 'kst-gi')}
                        <span className="air-kst__code">Kama_SEO_Tags::init();</span>
                    </p>

                </div>
            )}

        </PanelBody>

    );
};


registerPlugin('kama-seo-gutenberg', {
    render: () => (
        <>
            <PluginSidebarMoreMenuItem target="kama-seo-gutenberg" icon={ SeoIcon }>
                {__('Kama SEO Tags', 'kst-gi')}
            </PluginSidebarMoreMenuItem>
            <PluginSidebar name="kama-seo-gutenberg" title={__('Kama SEO Tags', 'kst-gi')} icon={ SeoIcon }>
                <MetaBlockField/>
            </PluginSidebar>
        </>
    ),
});