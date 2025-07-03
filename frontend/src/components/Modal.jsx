import React from 'react'
import { useNavigate } from 'react-router-dom';

const Modal = ({ onAction, platform, id }) => {
    const Navigate = useNavigate();

    const handleDelete = async () => {
        const token = localStorage.getItem(`${platform}AccessToken`);
        if(!token) return;

        try{
            const res = await fetch(`http://localhost:4000/${platform}/deletePlaylist`, {
                headers:{
                    Authorization: `Bearer ${token}`,
                    "Content-type" : "application/json",
                },
                method: "DELETE",
                body: JSON.stringify({
                    playlistId: id
                })
            })

            if (!res.ok) {
                const errData = await res.json();
                console.error('Failed to delete playlist:', errData);
            } else {
                alert('Playlist deleted ✅');
                Navigate("/dashboard");
            }
        }
        catch(err){
            console.error('Deletion error:', err.message);
            alert('Failed to delete playlist ❌');
        }
    }

    const setShowModalFalse = () => {
        onAction(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-slate-800 text-white p-6 rounded-xl max-w-sm w-full border border-slate-700 shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Are you sure?</h2>
                <p className="mb-6 text-gray-300">Do you really want to delete this playlist? This action cannot be undone.</p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => {
                            setShowModalFalse();
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition hover:cursor-pointer">
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            handleDelete()
                            setShowModalFalse()
                        }}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition hover:cursor-pointer">
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Modal;