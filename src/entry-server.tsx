import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import './i18n/config';
import App from './App';

export function render(url: string) {
  const html = renderToString(
    <StaticRouter location={url}>
      <App isSSR={true} />
    </StaticRouter>
  );

  return { html };
}