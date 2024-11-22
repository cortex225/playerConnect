import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';

interface UserStatus {
    isOnline: boolean;
    isTyping: boolean;
}

/**
 * Gestion du statut utilisateur en temps réel
 * @param userId ID de l'utilisateur à surveiller
 * @param setStatus Fonction pour mettre à jour le statut local
 */
export function getUserStatus(userId: string, setStatus: (status: UserStatus) => void) {
    if (!userId) return () => {};

    const userDocRef = doc(db, 'users', userId);

    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setStatus({
                isOnline: data.isOnline || false,
                isTyping: data.isTyping || false,
            });
        }
    });

    return unsubscribe;
}

/**
 * Met à jour le statut "en train d'écrire" pour un utilisateur
 * @param userId ID de l'utilisateur
 * @param isTyping Statut de frappe (true/false)
 */
export async function setTypingStatus(userId: string, isTyping: boolean) {
    if (!userId) return;

    const userDocRef = doc(db, 'users', userId);

    await updateDoc(userDocRef, {
        isTyping,
        lastActivity: serverTimestamp(),
    });
}

/**
 * Marque l'utilisateur comme en ligne
 * @param userId ID de l'utilisateur
 */
export async function setUserOnline(userId: string) {
    if (!userId) return;

    const userDocRef = doc(db, 'users', userId);

    await updateDoc(userDocRef, {
        isOnline: true,
        lastActivity: serverTimestamp(),
    });
}

/**
 * Marque l'utilisateur comme hors ligne
 * @param userId ID de l'utilisateur
 */
export async function setUserOffline(userId: string) {
    if (!userId) return;

    const userDocRef = doc(db, 'users', userId);

    await updateDoc(userDocRef, {
        isOnline: false,
        lastActivity: serverTimestamp(),
    });
}