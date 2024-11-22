// hooks/use-user-connection.ts
export const useUserConnection = () => {
    const connectUser = async (user: {
        id: string
        name: string
        image: string
        role: string
    }) => {
        try {
            const response = await fetch('/api/users-connected', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user }),
            })

            if (!response.ok) {
                throw new Error('Failed to connect user')
            }

            return true
        } catch (error) {
            console.error('Error connecting user:', error)
            return false
        }
    }

    return { connectUser }
}