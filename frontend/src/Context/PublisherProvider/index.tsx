import { ReactElement, ReactNode, createContext, useMemo } from 'react';
import usePublisher from './usePublisher';

export type PublisherContextType = ReturnType<typeof usePublisher>;
export const PublisherContext = createContext({} as PublisherContextType);
export type PublisherProviderProps = {
  children: ReactNode;
};
/**
 * PublisherProvider - React Context Provider for PublisherContext
 * PublisherContext contains all state and methods for local video publisher
 * We use Context to make the publisher available in many components across the app without
 * prop drilling: https://react.dev/learn/passing-data-deeply-with-context#use-cases-for-context
 * See usePublisher.tsx for methods and state
 * @param {PublisherProviderProps} props - The provider properties
 * @property {ReactNode} children - The content to be rendered
 * @returns {PublisherContextType} a context provider for a publisher
 */
export const PublisherProvider = ({ children }: PublisherProviderProps): ReactElement => {
  const publisherContext = usePublisher();
  const value = useMemo(() => publisherContext, [publisherContext]);
  return <PublisherContext.Provider value={value}>{children}</PublisherContext.Provider>;
};
