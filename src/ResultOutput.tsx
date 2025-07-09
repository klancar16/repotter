import React, { useEffect, useState } from "react";
import { useData } from "./context/data";
import type { PotType, PotId } from "./types";
import { ArrowRightIcon } from "./assets/Icons.tsx";

type RepotResult = {
    repottingChainArray: Array<Array<PotType>>;
    potsToBuy: Map<number, number>;
    approximateSoilNeeded: number;
};

const calculateSoilNeededForPotSize = (diameter: number): number => {
    // We calculate volume for cylinder, but because the pots used are
    // bucket-shaped we deduct 35% of the final volume. The diameter is in
    // centimeters, so we need to divide by 10 to get decimeters (1 dm^3 = 1 l).
    return (
        Math.PI *
        (diameter / 2 / 10) ** 2 * // radius * radius
        ((diameter / 10) * 0.9) * // approximate height of the pot
        0.65 // approximate reduction of the cylinder to fit the bucket shape
    );
};

const ResultOutput: React.FC = () => {
    const { data } = useData();
    const [outputData, setOutputData] = useState<RepotResult>();

    const groupPotsBySize = (pots: PotType[]): Map<number, Array<PotType>> => {
        const potsPerSize: Map<number, Array<PotType>> = new Map();

        for (const pot of pots) {
            // we can skip the plants that don't need to be repotted
            if (pot.has_plant && (!pot.size_increase || pot.size_increase === 0)) continue;

            const potSize = pot.pot_size;
            if (potsPerSize.has(potSize)) {
                potsPerSize.get(potSize)?.push(pot);
            } else {
                potsPerSize.set(potSize, [pot]);
            }
        }
        return potsPerSize;
    };

    function build_final_result(chains: Array<Array<PotType>>) {
        const chainsArray: Array<Array<PotType>> = [];
        const potsToBuy: Map<number, number> = new Map();
        let soilNeeded = 0;
        for (const chain of chains) {
            for (const pot of chain) {
                const newPotSize = pot.pot_size + (pot.size_increase ? pot.size_increase : 0);

                // calculate how much soil we need for the pot
                soilNeeded = soilNeeded + calculateSoilNeededForPotSize(newPotSize);

                // count new pots that need to be bought
                if (pot.id.includes("NEW")) {
                    potsToBuy.set(newPotSize, (potsToBuy.get(newPotSize) ?? 0) + 1);
                }
            }
        }
        return { chainsArray, potsToBuy, soilNeeded };
    }

    const buildRepottingChains = (potsPerSize: Map<number, Array<PotType>>) => {
        const processedPotIds: Array<PotId> = [];
        const potSizes: Array<number> = Array.from(potsPerSize.keys()).sort();
        const chains: Array<Array<PotType>> = [];

        for (const potSize of potSizes) {
            const pots = potsPerSize.get(potSize);
            if (!pots) {
                continue;
            }

            // iterate through all the pots of the size
            for (const pot of pots) {
                // if the pot doesn't have a plant, we can skip it here because it can't be repotted
                if (!pot.has_plant) continue;

                // if the pot was already processed, we can skip it
                if (processedPotIds.includes(pot.id)) continue;

                const chainArray: Array<PotType> = [];
                let nextInChain: PotType | undefined = pot;
                while (nextInChain) {
                    // put the current pot in the processed pots
                    processedPotIds.push(nextInChain.id);
                    chainArray.push(nextInChain);

                    const newSize: number = nextInChain.pot_size + nextInChain.size_increase;

                    // if the pot doesn't have a plant, we should stop the chain here
                    if (!nextInChain.has_plant) break;

                    // set nextInChain to a pot that matches "new size"
                    nextInChain = potsPerSize.get(newSize)?.find((x) => !processedPotIds.includes(x.id));

                    // If there is no next in the chain, it means we need to repot the plant in
                    // a new pot. We create a new pot with id=NEW_${newSize}.
                    if (nextInChain === undefined) {
                        chainArray.push({ id: `NEW_${newSize}`, pot_size: newSize } as PotType);
                    }
                }

                if (chainArray) {
                    chains.push(chainArray);
                }
            }
        }
        return chains;
    };

    useEffect(() => {
        const nonRetiredPots = data.filter((pot) => pot.has_plant || !pot.retired);
        const potsPerSize = groupPotsBySize(nonRetiredPots);
        const chains = buildRepottingChains(potsPerSize);
        const { potsToBuy, soilNeeded } = build_final_result(chains);

        setOutputData({
            potsToBuy: potsToBuy,
            approximateSoilNeeded: soilNeeded,
            repottingChainArray: chains,
        });
    }, [data]);

    const parsePotsToBuyMap = (potsToBuy: Map<number, number>) => {
        const content = [];
        for (const [key, value] of potsToBuy) {
            content.push(
                <p key={`pot-${key}`}>
                    {key}: {value}
                </p>,
            );
        }
        return content;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SummaryCard = ({ title, value }: { title: string; value: any }) => (
        <div className="summary-card">
            <div>
                <p className={"text-sm text-gray-600 dark:text-gray-300"}>{title}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</p>
            </div>
        </div>
    );

    const RepottingChain = ({ chain }: { chain: Array<PotType> }) => (
        <div className="p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md text-center w-full sm:w-auto">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Plant from</p>
                    <p className="font-bold text-lg text-gray-900 dark:text-gray-100">{chain[0].id}</p>
                </div>

                {chain.slice(1).map((pot, index) => (
                    <React.Fragment key={index}>
                        <ArrowRightIcon />
                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md text-center w-full sm:w-auto">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Moves to</p>
                            <p className="font-bold text-lg text-gray-900 dark:text-gray-100">{pot.id}</p>
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );

    return (
        <div>
            {outputData ? (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md ">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Repotting Plan</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <SummaryCard
                            title="New Pots Needed"
                            value={outputData?.potsToBuy ? parsePotsToBuyMap(outputData?.potsToBuy) : <p></p>}
                        />
                        <SummaryCard
                            title="Approx. Soil Needed"
                            value={`${outputData?.approximateSoilNeeded.toFixed(2)} L`}
                        />
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Repotting Chains</h3>
                        {outputData.repottingChainArray.map((chain, index) => (
                            <RepottingChain key={index} chain={chain} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center bg-white dark:bg-gray-800 p-12 rounded-xl shadow-md">
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                        Your plan will appear here
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Upload a CSV file to generate your repotting steps.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ResultOutput;
