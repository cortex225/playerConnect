// pages/api/users/connected.ts (suite)
import { NextApiRequest, NextApiResponse } from 'next'
import { pusherServer } from '@/lib/pusher'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    try {
        const { user } = req.body

        // Trigger l'événement de mise à jour des utilisateurs connectés
        await pusherServer.trigger('connected-users', 'update', user)

        res.status(200).json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        res.status(500).json({ message: 'Error updating connected users' })
    }
}