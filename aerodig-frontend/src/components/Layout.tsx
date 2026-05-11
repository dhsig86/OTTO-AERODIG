import type { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar, MobileHeader } from './Sidebar';

/**
 * Layout principal do OTTO Aerodigestive Hub.
 *
 * Modo embed (?embed=1):
 *   Quando a URL contém o parâmetro `embed=1`, a sidebar e o header
 *   são omitidos, renderizando apenas o conteúdo principal. Isso permite
 *   que o OTTO CALC-HUB (e outros módulos) incorporem calculadoras via
 *   <iframe src="https://otto-aerodig.vercel.app/calculators?embed=1&highlight=myer-cotton-calc">
 *   sem o chrome de navegação do hub.
 */
export function Layout({ children }: { children: ReactNode }) {
  co