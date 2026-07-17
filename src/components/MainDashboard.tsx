
import React from 'react';
import { ArgentinaMap } from './ArgentinaMap';
import { Award, Smartphone } from 'lucide-react';

export const MainDashboard = () => {
    return (
        <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full relative z-10 space-y-8 text-left">
            {/* Employee of the month */}
            <div className="bg-[#111720] border border-blue-brand/20 p-6 rounded-2xl flex items-center gap-6">
                <div className="bg-yellow-500/20 p-4 rounded-full">
                    <Award className="w-10 h-10 text-yellow-500" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-white">Empleado del Mes: Carlos Gómez</h2>
                   <p className="text-gray-400">Excelente desempeño en entregas y servicio al cliente durante junio.</p>
                </div>
            </div>

            {/* Argentina Map & QR */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-[#111720] p-6 rounded-2xl border border-gray-800">
                    <ArgentinaMap markers={[]} gpsSimulating={false} gpsProgress={0} />
                </div>
                <div className="bg-[#111720] border border-gray-800 p-6 rounded-2xl flex flex-col items-center gap-4 text-center">
                    <div className="flex items-center gap-2">
                        <Smartphone className="w-6 h-6 text-purple-500" />
                        <h3 className="font-bold text-white">App de Gestión Logística</h3>
                    </div>
                    <div className="bg-white p-4 rounded-xl">
                       <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://landing-deliveryplus-1nvy.vercel.app/" alt="QR de descarga" width="200" height="200" />
                    </div>
                    <p className="text-gray-400 text-sm">Escanea para acceder a herramientas en tiempo real</p>
                </div>
            </div>
        </div>
    );
};
