import { useEffect } from 'react';
import { useCms } from '../context/CmsContext';
import { BlogPost, CaseStudy } from '../types/cms';

interface SeoMetaOptions {
  activeTab: string;
  activePost?: BlogPost | null;
  activeStudy?: CaseStudy | null;
  customTitle?: string;
  customDescription?: string;
  customOgImage?: string;
}

export const useSeoMeta = ({
  activeTab,
  activePost,
  activeStudy,
  customTitle,
  customDescription,
  customOgImage,
}: SeoMetaOptions) => {
  const { cmsData } = useCms();
  const { settings } = cmsData;

  useEffect(() => {
    const siteTitle = settings.companyName || '9xenai';
    let pageTitle = '';
    let pageDescription = '';
    let ogImage = customOgImage || '';

    if (customTitle) {
      pageTitle = customTitle;
    } else if (activePost) {
      pageTitle = activePost.title;
      pageDescription = activePost.excerpt || '';
      if (activePost.coverImage) {
        ogImage = activePost.coverImage;
      }
    } else if (activeStudy) {
      pageTitle = activeStudy.title;
      pageDescription = activeStudy.summary || '';
      if (activeStudy.coverImage) {
        ogImage = activeStudy.coverImage;
      }
    } else {
      switch (activeTab) {
        case 'home':
          pageTitle = 'Enterprise Autonomous Intelligence';
          pageDescription = 'Corporate hub for fine-tuned enterprise neural systems, secure agentic workflows, and SOC-2 compliance architectures.';
          break;
        case 'about':
          pageTitle = 'About Our Vision & Teams';
          pageDescription = 'Discover the researchers, scientists, and engineers driving compliance-first enterprise AI at 9xenai.';
          break;
        case 'services':
          pageTitle = 'Autonomous & Agentic Services';
          pageDescription = 'Autonomous agent engineering, specialized model fine-tuning, and robust compliance auditing services.';
          break;
        case 'products':
          pageTitle = 'Cognitive Products';
          pageDescription = 'Deploy secure enterprise chatbots, intelligent document parsers, and custom model registries.';
          break;
        case 'platforms':
          pageTitle = 'Our Architecture & Security Platform';
          pageDescription = 'Compliance platform with multi-tenant isolation, VPC peering, and secure S3 encryption pipelines.';
          break;
        case 'blog':
          pageTitle = 'Neural Frontiers Blog & Research';
          pageDescription = 'Deep-dive engineering posts about custom LLM architectures, fine-tuning benchmarks, and regtech governance.';
          break;
        case 'case-studies':
          pageTitle = 'Enterprise Case Studies & Deployments';
          pageDescription = 'Read about how global corporations safely integrated autonomous agents to achieve massive performance gains.';
          break;
        case 'careers':
          pageTitle = 'Join the Intelligence Horizon — Careers';
          pageDescription = 'Explore careers in deep learning engineering, security-first compliance development, and developer relations.';
          break;
        case 'contact':
          pageTitle = 'Executive Inquiries & Contact';
          pageDescription = 'Reach out directly to the 9xenai corporate headquarters. Request specialized model audits and custom integrations.';
          break;
        case 'admin':
          pageTitle = 'Corporate CMS Administration Portal';
          pageDescription = 'Authorized access for updating legal policies, engineering blogs, team members, and telemetry monitors.';
          break;
        case 'privacy':
          pageTitle = 'Data Privacy Policy & SOC-2';
          pageDescription = 'Our corporate privacy policy, SOC-2 alignment, and strict client data encapsulation procedures.';
          break;
        case 'terms':
          pageTitle = 'Corporate Terms of Service & SLA';
          pageDescription = 'Enterprise Service Level Agreements (SLA), token allocations, and secure acceptable-use mandates.';
          break;
        default:
          pageTitle = 'Page Not Found';
          pageDescription = 'The requested coordinates are not registered on our networks.';
          break;
      }
    }

    if (customDescription) {
      pageDescription = customDescription;
    }

    const finalTitle = pageTitle ? `${pageTitle} | ${siteTitle}` : `${siteTitle} - Autonomous Intelligence Hub`;
    document.title = finalTitle;

    const updateMetaTag = (attributeName: string, attributeValue: string, contentValue: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    const finalDescription = pageDescription || settings.tagline || 'Autonomous intelligence, LLM fine-tuning and agentic workflows for enterprise governance.';
    updateMetaTag('name', 'description', finalDescription);
    updateMetaTag('property', 'og:title', finalTitle);
    updateMetaTag('property', 'og:description', finalDescription);
    updateMetaTag('property', 'og:type', activePost ? 'article' : 'website');
    
    const finalOgImage = ogImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200';
    updateMetaTag('property', 'og:image', finalOgImage);
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', finalTitle);
    updateMetaTag('name', 'twitter:description', finalDescription);
    updateMetaTag('name', 'twitter:image', finalOgImage);
  }, [activeTab, activePost, activeStudy, customTitle, customDescription, customOgImage, settings]);
};
