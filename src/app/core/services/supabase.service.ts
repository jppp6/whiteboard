import { Injectable, signal } from '@angular/core';
import {
    AuthChangeEvent,
    AuthSession,
    createClient,
    Session,
    SupabaseClient,
} from '@supabase/supabase-js';
import { environment } from '../../../environments/environments';
import { Widget } from '../utils/types';

@Injectable({
    providedIn: 'root',
})
export class SupabaseService {
    private supabaseClient: SupabaseClient;
    _session = signal<AuthSession | null>(null);

    constructor() {
        this.supabaseClient = createClient(
            environment.supabaseUrl,
            environment.supabaseKey,
            { auth: { autoRefreshToken: true, persistSession: true } }
        );
    }

    async newWhiteboard(name: string, notes: string) {
        const { data, error } = await this.supabaseClient
            .from('whiteboards')
            .insert({ name: name, notes: notes })
            .select('id')
            .single();

        if (error) {
            console.error('Error creating whiteboard:', error);
            return { data: [], error: 'Error creating whiteboards' };
        }

        return { data: data.id, error: null };
    }

    async getAllWhiteboards() {
        const { data, error } = await this.supabaseClient
            .from('whiteboards')
            .select('id, name, notes');

        if (error) {
            console.error('Error fetching whiteboards:', error.message);
            return { data: [], error: 'Error fetching whiteboards' };
        }

        return { data: data, error: null };
    }

    async getWhiteboard(id: string) {
        const { data, error } = await this.supabaseClient
            .from('whiteboards')
            .select('id, name, widgets')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching whiteboards:', error.message);
            return {
                data: {
                    id: '',
                    name: '',
                    widgets: [],
                },
                error: 'Error fetching whiteboard',
            };
        }

        return { data: data, error: null };
    }

    async updateWhiteboard(id: string, widgets: Widget[]) {
        const { error } = await this.supabaseClient
            .from('whiteboards')
            .update({ widgets })
            .eq('id', id);

        if (error) {
            console.error('Error updating whiteboard:', error.message);
            return 'Error updating whiteboard';
        }

        return null;
    }

    get session() {
        this.supabaseClient.auth.getSession().then(({ data }) => {
            this._session.set(data.session);
        });
        return this._session;
    }

    authChanges(
        callback: (event: AuthChangeEvent, session: Session | null) => void
    ) {
        return this.supabaseClient.auth.onAuthStateChange(callback);
    }

    signIn(email: string) {
        return this.supabaseClient.auth.signInWithOtp({ email });
    }

    signOut() {
        return this.supabaseClient.auth.signOut();
    }
}
