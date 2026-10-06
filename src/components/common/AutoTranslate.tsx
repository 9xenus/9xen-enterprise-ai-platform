import React, { useState, useEffect } from 'react';
import { useCms } from '../../context/CmsContext';

interface AutoTranslateProps {
  text: string;
  as?: React.ElementType;
  className?: string;
  html?: boolean;
}

export const AutoTranslate: React.FC<AutoTranslateProps> = ({ text, as: Component = 'span', className, html = false }) => {
  const { language, translateText } = useCms();
  const [translated, setTranslated] = useState<string>(text);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!text) {
      setTranslated('');
      return;
    }
    if (language === 'en') {
      setTranslated(text);
      return;
    }
    let isMounted = true;
    const performTranslation = async () => {
      setLoading(true);
      try {
        const res = await translateText(text, language);
        if (isMounted) {
          setTranslated(res);
        }
      } catch (err) {
        console.warn('AutoTranslate error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    performTranslation();

    return () => {
      isMounted = false;
    };
  }, [text, language, translateText]);

  if (loading) {
    return (
      <Component className={`${className} animate-pulse bg-slate-800/20 text-transparent rounded-md select-none`}>
        {text}
      </Component>
    );
  }

  if (html) {
    return <Component className={className} dangerouslySetInnerHTML={{ __html: translated }} />;
  }

  return <Component className={className}>{translated}</Component>;
};
