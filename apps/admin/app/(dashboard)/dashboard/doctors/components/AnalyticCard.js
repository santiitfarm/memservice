

const AnalyticCard = ({ title, value, value2, icon, color }) => (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-full ${color} text-white`}>{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold dark:text-gray-500">
                    {value}
                </p>
            </div>
        </div>
    </div>
);

export default AnalyticCard;