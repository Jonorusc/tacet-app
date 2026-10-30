import { create } from 'zustand';
import { TacetClient } from '@/src/lib/tacet-client';

interface AIStore {
    // State
    isOllamaAvailable: boolean;
    availableModels: string[];
    currentModel: string | null;
    isModelLoaded: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    checkAvailability: () => Promise<void>;
    loadModels: () => Promise<void>;
    loadModel: (model: string) => Promise<void>;
    unloadModel: () => Promise<void>;
    testModel: (model: string) => Promise<string>;
    clearError: () => void;
}

export const useAIStore = create<AIStore>((set, get) => ({
    // Initial state
    isOllamaAvailable: false,
    availableModels: [],
    currentModel: null,
    isModelLoaded: false,
    isLoading: false,
    error: null,

    // Check if Ollama is available
    checkAvailability: async () => {
        set({ isLoading: true, error: null });
        try {
            const available = await TacetClient.checkOllamaAvailable();
            set({ isOllamaAvailable: available, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to check Ollama',
                isLoading: false,
                isOllamaAvailable: false,
            });
        }
    },

    // Load available models
    loadModels: async () => {
        set({ isLoading: true, error: null });
        try {
            const models = await TacetClient.listOllamaModels();
            set({ availableModels: models, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to load models',
                isLoading: false,
            });
        }
    },

    // Load a specific model
    loadModel: async (model: string) => {
        set({ isLoading: true, error: null });
        try {
            await TacetClient.loadOllamaModel(model);
            set({
                currentModel: model,
                isModelLoaded: true,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to load model',
                isLoading: false,
            });
        }
    },

    // Unload current model
    unloadModel: async () => {
        set({ isLoading: true, error: null });
        try {
            await TacetClient.unloadOllamaModel();
            set({
                currentModel: null,
                isModelLoaded: false,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to unload model',
                isLoading: false,
            });
        }
    },

    // Test a model
    testModel: async (model: string): Promise<string> => {
        set({ isLoading: true, error: null });
        try {
            const response = await TacetClient.testOllama(model);
            set({ isLoading: false });
            return response;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to test model',
                isLoading: false,
            });
            throw error;
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));
